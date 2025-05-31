// 主要應用程式控制邏輯
class ZhongshanDashboard {
    constructor() {
        this.activePumps = [];
        this.isAutoMode = false;
        this.updateInterval = null;
        this.operationLog = [];
        this.currentWaterLevel = 1.15;
        this.currentRainfall = 25;
        this.currentExternalLevel = 1.0;
        this.currentWindSpeed = 5;
    }

    // 初始化儀表板
    init() {
        this.showLoadingScreen();
        this.initEventListeners();
        this.initPumpGrid();
        this.initChart();
        this.startRealTimeUpdates();
        this.initSystemStatus();
        
        // 3秒後隱藏載入畫面
        setTimeout(() => {
            this.hideLoadingScreen();
            this.addOperationLog('系統初始化完成', 'success');
        }, 3000);
    }

    // 顯示載入畫面
    showLoadingScreen() {
        const loadingScreen = document.getElementById('loadingScreen');
        const progressBar = loadingScreen.querySelector('.loading-progress');
        
        let progress = 0;
        const interval = setInterval(() => {
            progress += Math.random() * 15;
            if (progress >= 100) {
                progress = 100;
                clearInterval(interval);
            }
            progressBar.style.width = progress + '%';
        }, 200);
    }

    // 隱藏載入畫面
    hideLoadingScreen() {
        const loadingScreen = document.getElementById('loadingScreen');
        const mainContainer = document.getElementById('mainContainer');
        
        loadingScreen.classList.add('hidden');
        mainContainer.classList.add('loaded');
    }

    // 初始化事件監聽器
    initEventListeners() {
        // 水位滑桿
        const waterSlider = document.getElementById('waterSlider');
        if (waterSlider) {
            waterSlider.addEventListener('input', (e) => {
                this.updateWaterLevel(parseFloat(e.target.value));
            });
        }

        // 環境參數滑桿
        const rainfallSlider = document.getElementById('rainfallSlider');
        if (rainfallSlider) {
            rainfallSlider.addEventListener('input', (e) => {
                this.updateRainfall(parseInt(e.target.value));
            });
        }

        const externalSlider = document.getElementById('externalSlider');
        if (externalSlider) {
            externalSlider.addEventListener('input', (e) => {
                this.updateExternalLevel(parseFloat(e.target.value));
            });
        }

        const windSlider = document.getElementById('windSlider');
        if (windSlider) {
            windSlider.addEventListener('input', (e) => {
                this.updateWindSpeed(parseInt(e.target.value));
            });
        }

        // 預設按鈕
        const presetButtons = document.querySelectorAll('.preset-btn');
        presetButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const level = parseFloat(e.target.dataset.level);
                if (waterSlider) {
                    waterSlider.value = level;
                    this.updateWaterLevel(level);
                }
            });
        });

        // 圖表控制按鈕
        const chartButtons = document.querySelectorAll('.chart-btn');
        chartButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                chartButtons.forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.updateChartPeriod(e.target.dataset.period);
            });
        });

        // 緊急停止按鈕
        const emergencyBtn = document.getElementById('emergencyStop');
        if (emergencyBtn) {
            emergencyBtn.addEventListener('click', () => {
                this.emergencyStop();
            });
        }

        // 自動模式按鈕
        const autoBtn = document.getElementById('autoMode');
        if (autoBtn) {
            autoBtn.addEventListener('click', () => {
                this.toggleAutoMode();
            });
        }
    }

    // 更新水位顯示
    updateWaterLevel(level) {
        this.currentWaterLevel = level;
        
        // 更新3D水位顯示
        const waterLevelElem = document.getElementById('waterLevel');
        const levelValueElem = document.getElementById('levelValue');
        
        if (waterLevelElem && levelValueElem) {
            const heightPercent = (level / 2.5) * 100;
            waterLevelElem.style.height = heightPercent + '%';
            levelValueElem.textContent = level.toFixed(2);
        }

        // 更新狀態徽章
        this.updateWaterStatus(level);
        
        // 更新AI預測
        this.updateAIPrediction();
        
        // 更新圖表
        if (typeof chartManager !== 'undefined') {
            chartManager.addRealTimeData(level);
        }
        
        // 記錄操作
        this.addOperationLog(`水位調整至 ${level.toFixed(2)}m`, 'info');
    }

    // 更新水位狀態
    updateWaterStatus(level) {
        const waterStatus = document.getElementById('waterStatus');
        if (!waterStatus) return;

        if (level >= 1.4) {
            waterStatus.textContent = '危險';
            waterStatus.className = 'status-badge danger';
        } else if (level >= 1.3) {
            waterStatus.textContent = '警戒';
            waterStatus.className = 'status-badge warning';
        } else if (level >= 1.2) {
            waterStatus.textContent = '注意';
            waterStatus.className = 'status-badge caution';
        } else {
            waterStatus.textContent = '正常';
            waterStatus.className = 'status-badge normal';
        }
    }

    // 更新降雨強度
    updateRainfall(intensity) {
        this.currentRainfall = intensity;
        const rainfallValue = document.getElementById('rainfallValue');
        if (rainfallValue) {
            rainfallValue.textContent = intensity + ' mm/hr';
        }
        this.updateAIPrediction();
        this.addOperationLog(`降雨強度調整至 ${intensity}mm/hr`, 'info');
    }

    // 更新外水位
    updateExternalLevel(level) {
        this.currentExternalLevel = level;
        const externalValue = document.getElementById('externalValue');
        if (externalValue) {
            externalValue.textContent = level.toFixed(1) + ' m';
        }
        this.updateAIPrediction();
    }

    // 更新風速
    updateWindSpeed(speed) {
        this.currentWindSpeed = speed;
        const windValue = document.getElementById('windValue');
        if (windValue) {
            windValue.textContent = speed + ' m/s';
        }
    }

    // 更新AI預測
    updateAIPrediction() {
        // 使用AI引擎生成預測
        const prediction = aiEngine.generateDispatchRecommendation(
            this.currentWaterLevel, 
            this.currentRainfall, 
            this.currentExternalLevel
        );

        // 更新預測顯示
        this.updatePredictionDisplay(prediction);
        
        // 更新抽水機建議
        this.updatePumpRecommendations(prediction.recommendedPumps);
        
        // 更新信心度圓圈
        this.updateConfidenceCircle(prediction.confidence);

        // 自動模式下執行建議
        if (this.isAutoMode) {
            this.executeAIRecommendation(prediction);
        }
    }

    // 更新預測顯示
    updatePredictionDisplay(prediction) {
        const predictionAction = document.querySelector('.prediction-action');
        const predictedLevel = document.getElementById('predictedLevel');
        const recommendedPumps = document.getElementById('recommendedPumps');
        const totalCapacity = document.getElementById('totalCapacity');

        if (predictionAction) predictionAction.textContent = prediction.action;
        if (predictedLevel) predictedLevel.textContent = prediction.predictedLevel.toFixed(2) + 'm';
        if (recommendedPumps) recommendedPumps.textContent = prediction.recommendedPumps.length + '台';
        if (totalCapacity) totalCapacity.textContent = prediction.totalCapacity + ' C.M.S';

        // 更新預測結果樣式
        const predictionResult = document.getElementById('predictionResult');
        if (predictionResult) {
            predictionResult.className = `prediction-result ${prediction.riskLevel}`;
        }
    }

    // 更新信心度圓圈
    updateConfidenceCircle(confidence) {
        const confidenceCircle = document.getElementById('confidenceCircle');
        const confidenceValue = document.getElementById('confidenceValue');
        
        if (confidenceCircle && confidenceValue) {
            const circumference = 2 * Math.PI * 45;
            const offset = circumference - (confidence / 100) * circumference;
            
            confidenceCircle.style.strokeDashoffset = offset;
            confidenceValue.textContent = confidence.toFixed(1);
        }
    }

    // 初始化抽水機網格
    initPumpGrid() {
        const pumpGrid = document.getElementById('pumpGrid');
        if (!pumpGrid) return;

        pumpGrid.innerHTML = '';

        ZHONGSHAN_STATION_CONFIG.pumps.forEach(pump => {
            const pumpItem = this.createPumpItem(pump);
            pumpGrid.appendChild(pumpItem);
        });
    }

    // 建立抽水機項目
    createPumpItem(pump) {
        const pumpItem = document.createElement('div');
        pumpItem.className = 'pump-item';
        pumpItem.dataset.pumpId = pump.id;

        pumpItem.innerHTML = `
            <div class="pump-header">
                <div class="pump-id">#${pump.id}</div>
                <div class="pump-status" id="pumpStatus${pump.id}"></div>
            </div>
            <div class="pump-details">
                <div class="pump-model">${pump.brand} ${pump.model}</div>
                <div>功率: ${pump.power}kW</div>
                <div>容量: ${pump.capacity} C.M.S</div>
                <div>啟動: ${pump.autoStart}m</div>
                <div>引擎: ${pump.engine}</div>
            </div>
        `;

        // 點擊切換抽水機狀態
        pumpItem.addEventListener('click', () => {
            this.togglePump(pump.id);
        });

        return pumpItem;
    }

    // 更新抽水機建議
    updatePumpRecommendations(recommendedPumps) {
        ZHONGSHAN_STATION_CONFIG.pumps.forEach(pump => {
            const pumpItem = document.querySelector(`[data-pump-id="${pump.id}"]`);
            const pumpStatus = document.getElementById(`pumpStatus${pump.id}`);
            
            if (pumpItem && pumpStatus) {
                const isRecommended = recommendedPumps.includes(pump.id);
                const isActive = this.activePumps.includes(pump.id);

                // 移除所有狀態類別
                pumpItem.classList.remove('active', 'recommended');
                pumpStatus.classList.remove('active', 'recommended');

                if (isActive) {
                    pumpItem.classList.add('active');
                    pumpStatus.classList.add('active');
                } else if (isRecommended) {
                    pumpItem.classList.add('recommended');
                    pumpStatus.classList.add('recommended');
                }
            }
        });

        // 更新總計
        this.updatePumpSummary();
    }

    // 切換抽水機狀態
    togglePump(pumpId) {
        const index = this.activePumps.indexOf(pumpId);
        
        if (index > -1) {
            this.activePumps.splice(index, 1);
            this.addOperationLog(`停止抽水機 #${pumpId}`, 'warning');
        } else {
            this.activePumps.push(pumpId);
            this.addOperationLog(`啟動抽水機 #${pumpId}`, 'success');
        }

        this.updatePumpSummary();
        this.updateSystemStatus();
    }

    // 更新抽水機總計
    updatePumpSummary() {
        const activePumpsElem = document.getElementById('activePumps');
        const totalPowerElem = document.getElementById('totalPower');
        const totalFlowElem = document.getElementById('totalFlow');

        if (activePumpsElem) {
            activePumpsElem.textContent = this.activePumps.length;
        }

        // 計算總功率和流量
        let totalPower = 0;
        let totalFlow = 0;

        this.activePumps.forEach(pumpId => {
            const pump = ZHONGSHAN_STATION_CONFIG.pumps.find(p => p.id === pumpId);
            if (pump) {
                totalPower += pump.power;
                totalFlow += pump.capacity;
            }
        });

        if (totalPowerElem) totalPowerElem.textContent = totalPower.toLocaleString() + ' kW';
        if (totalFlowElem) totalFlowElem.textContent = totalFlow + ' C.M.S';
    }

    // 初始化圖表
    initChart() {
        if (typeof chartManager !== 'undefined') {
            chartManager.init();
        }
    }

    // 更新圖表週期
    updateChartPeriod(period) {
        if (typeof chartManager !== 'undefined') {
            chartManager.updatePeriod(period);
        }
        this.addOperationLog(`切換圖表週期至 ${period}`, 'info');
    }

    // 執行AI建議
    executeAIRecommendation(prediction) {
        const recommendedPumps = prediction.recommendedPumps;
        
        // 停止所有不在建議清單中的抽水機
        this.activePumps.forEach(pumpId => {
            if (!recommendedPumps.includes(pumpId)) {
                const index = this.activePumps.indexOf(pumpId);
                if (index > -1) {
                    this.activePumps.splice(index, 1);
                }
            }
        });

        // 啟動所有建議的抽水機
        recommendedPumps.forEach(pumpId => {
            if (!this.activePumps.includes(pumpId)) {
                this.activePumps.push(pumpId);
            }
        });

        this.updatePumpRecommendations(recommendedPumps);
        this.addOperationLog(`AI自動調度: ${prediction.action}`, 'success');
    }

    // 緊急停止
    emergencyStop() {
        this.activePumps = [];
        this.isAutoMode = false;
        
        // 更新所有抽水機狀態
        ZHONGSHAN_STATION_CONFIG.pumps.forEach(pump => {
            const pumpItem = document.querySelector(`[data-pump-id="${pump.id}"]`);
            const pumpStatus = document.getElementById(`pumpStatus${pump.id}`);
            
            if (pumpItem && pumpStatus) {
                pumpItem.classList.remove('active', 'recommended');
                pumpStatus.classList.remove('active', 'recommended');
            }
        });

        this.updatePumpSummary();
        this.addOperationLog('執行緊急停止', 'warning');
        
        // 更新自動模式按鈕
        const autoBtn = document.getElementById('autoMode');
        if (autoBtn) {
            autoBtn.classList.remove('active');
            autoBtn.innerHTML = '<i class="fas fa-magic"></i> AI自動模式';
        }
    }

    // 切換自動模式
    toggleAutoMode() {
        this.isAutoMode = !this.isAutoMode;
        
        const autoBtn = document.getElementById('autoMode');
        if (autoBtn) {
            if (this.isAutoMode) {
                autoBtn.classList.add('active');
                autoBtn.innerHTML = '<i class="fas fa-stop"></i> 停止自動';
                this.addOperationLog('啟動AI自動調度模式', 'success');
                this.updateAIPrediction(); // 立即執行一次AI建議
            } else {
                autoBtn.classList.remove('active');
                autoBtn.innerHTML = '<i class="fas fa-magic"></i> AI自動模式';
                this.addOperationLog('停止AI自動調度模式', 'info');
            }
        }
    }

    // 初始化系統狀態
    initSystemStatus() {
        this.updateSystemStatus();
    }

    // 更新系統狀態
    updateSystemStatus() {
        // 檢查燃料狀態
        const fuelCheck = aiEngine.checkFuelSufficiency(this.activePumps);
        
        // 檢查發電機需求
        const totalPower = this.activePumps.reduce((sum, pumpId) => {
            const pump = ZHONGSHAN_STATION_CONFIG.pumps.find(p => p.id === pumpId);
            return sum + (pump ? pump.power : 0);
        }, 0);
        
        const generatorNeeded = totalPower > 3000 || this.activePumps.length >= 5;
        
        // 更新發電機狀態顯示
        const generatorStatus = document.querySelector('.generator-status .status-value');
        if (generatorStatus) {
            if (generatorNeeded) {
                generatorStatus.textContent = '需要啟動 (500kW)';
                generatorStatus.style.color = '#f59e0b';
            } else {
                generatorStatus.textContent = '待機 (500kW)';
                generatorStatus.style.color = '#94a3b8';
            }
        }
    }

    // 添加操作日誌
    addOperationLog(message, type = 'info') {
        const logContainer = document.getElementById('operationLog');
        if (!logContainer) return;

        const logItem = document.createElement('div');
        logItem.className = 'log-item';

        const now = new Date();
        const typeText = {
            'success': '完成',
            'warning': '警告',
            'info': '資訊',
            'error': '錯誤'
        };

        logItem.innerHTML = `
            <div class="log-time">${now.toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' })}</div>
            <div class="log-message">${message}</div>
            <div class="log-status ${type}">${typeText[type] || '資訊'}</div>
        `;

        logContainer.insertBefore(logItem, logContainer.firstChild);

        // 保持最多10個日誌項目
        while (logContainer.children.length > 10) {
            logContainer.removeChild(logContainer.lastChild);
        }

        // 將日誌添加到內部陣列
        this.operationLog.unshift({
            timestamp: now,
            message: message,
            type: type
        });

        // 保持最多50個日誌記錄
        if (this.operationLog.length > 50) {
            this.operationLog.pop();
        }
    }

    // 開始即時更新
    startRealTimeUpdates() {
        // 更新系統時間
        this.updateSystemTime();
        setInterval(() => {
            this.updateSystemTime();
        }, 1000);

        // 每30秒自動更新AI預測
        setInterval(() => {
            this.updateAIPrediction();
            this.addOperationLog('AI系統自動更新', 'info');
        }, 30000);

        // 每5分鐘更新系統狀態
        setInterval(() => {
            this.updateSystemStatus();
        }, 300000);
    }

    // 更新系統時間
    updateSystemTime() {
        const timeElem = document.getElementById('currentTime');
        const dateElem = document.getElementById('currentDate');
        
        if (timeElem && dateElem) {
            const now = new Date();
            timeElem.textContent = now.toLocaleTimeString('zh-TW');
            dateElem.textContent = now.toLocaleDateString('zh-TW');
        }
    }

    // 匯出操作日誌
    exportOperationLog() {
        const exportData = {
            station: '中山抽水站',
            exportTime: new Date().toISOString(),
            logs: this.operationLog,
            currentStatus: {
                waterLevel: this.currentWaterLevel,
                activePumps: this.activePumps,
                autoMode: this.isAutoMode,
                aiAccuracy: 88.24
            }
        };

        const dataStr = JSON.stringify(exportData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `zhongshan_operation_log_${new Date().toISOString().slice(0, 10)}.json`;
        link.click();
    }

    // 銷毀儀表板
    destroy() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }
        
        if (typeof chartManager !== 'undefined') {
            chartManager.destroy();
        }
    }
}

// 全域儀表板實例
const dashboard = new ZhongshanDashboard();

// 當DOM載入完成時啟動
document.addEventListener('DOMContentLoaded', () => {
    dashboard.init();
});

// 全域函數供HTML調用
window.exportOperationLog = () => dashboard.exportOperationLog();
window.emergencyStop = () => dashboard.emergencyStop();
window.toggleAutoMode = () => dashboard.toggleAutoMode();

// 匯出供其他模組使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ZhongshanDashboard, dashboard };
}
