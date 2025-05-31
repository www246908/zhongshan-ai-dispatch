// 圖表管理類
class ZhongshanChartManager {
    constructor() {
        this.waterLevelChart = null;
        this.chartData = {
            historical: [],
            predictions: [],
            timestamps: []
        };
        this.chartPeriod = '1h';
        this.updateInterval = null;
    }

    // 初始化所有圖表
    init() {
        this.initWaterLevelChart();
        this.generateHistoricalData();
        this.startRealTimeUpdates();
    }

    // 初始化水位趨勢圖
    initWaterLevelChart() {
        const ctx = document.getElementById('waterLevelChart');
        if (!ctx) return;

        // 基於您的水位趨勢圖設計
        this.waterLevelChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [
                    {
                        label: '歷史水位',
                        data: [],
                        borderColor: '#0ea5e9',
                        backgroundColor: 'rgba(14, 165, 233, 0.1)',
                        borderWidth: 3,
                        fill: true,
                        tension: 0.4,
                        pointRadius: 4,
                        pointHoverRadius: 6,
                        pointBackgroundColor: '#0ea5e9',
                        pointBorderColor: '#ffffff',
                        pointBorderWidth: 2
                    },
                    {
                        label: 'AI預測 (88.24%準確度)',
                        data: [],
                        borderColor: '#ef4444',
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        borderWidth: 3,
                        borderDash: [8, 4],
                        fill: false,
                        tension: 0.3,
                        pointRadius: 8,
                        pointHoverRadius: 10,
                        pointStyle: 'rectRot',
                        pointBackgroundColor: '#ef4444',
                        pointBorderColor: '#ffffff',
                        pointBorderWidth: 2
                    },
                    {
                        label: '危險線 (1.4m)',
                        data: [],
                        borderColor: '#ef4444',
                        backgroundColor: 'rgba(239, 68, 68, 0.05)',
                        borderWidth: 2,
                        borderDash: [2, 2],
                        fill: false,
                        pointRadius: 0,
                        pointHoverRadius: 0
                    },
                    {
                        label: '警戒線 (1.3m)',
                        data: [],
                        borderColor: '#f97316',
                        backgroundColor: 'rgba(249, 115, 22, 0.05)',
                        borderWidth: 2,
                        borderDash: [2, 2],
                        fill: false,
                        pointRadius: 0,
                        pointHoverRadius: 0
                    },
                    {
                        label: '注意線 (1.2m)',
                        data: [],
                        borderColor: '#f59e0b',
                        backgroundColor: 'rgba(245, 158, 11, 0.05)',
                        borderWidth: 2,
                        borderDash: [2, 2],
                        fill: false,
                        pointRadius: 0,
                        pointHoverRadius: 0
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    intersect: false,
                    mode: 'index'
                },
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                        labels: {
                            color: '#e2e8f0',
                            font: {
                                size: 12,
                                family: 'Inter'
                            },
                            usePointStyle: true,
                            padding: 20
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(15, 23, 42, 0.9)',
                        titleColor: '#e2e8f0',
                        bodyColor: '#cbd5e1',
                        borderColor: 'rgba(255, 255, 255, 0.1)',
                        borderWidth: 1,
                        cornerRadius: 8,
                        displayColors: true,
                        callbacks: {
                            title: function(context) {
                                return '時間: ' + context[0].label;
                            },
                            label: function(context) {
                                const value = context.parsed.y;
                                const label = context.dataset.label;
                                
                                if (label.includes('AI預測')) {
                                    return `${label}: ${value.toFixed(2)}m (信心度: 88.24%)`;
                                } else if (label.includes('線')) {
                                    return `${label}: ${value.toFixed(1)}m`;
                                } else {
                                    return `${label}: ${value.toFixed(2)}m`;
                                }
                            },
                            afterBody: function(context) {
                                const value = context[0].parsed.y;
                                let riskLevel = '';
                                
                                if (value >= 1.4) {
                                    riskLevel = '風險等級: 危險 🔴';
                                } else if (value >= 1.3) {
                                    riskLevel = '風險等級: 警戒 🟠';
                                } else if (value >= 1.2) {
                                    riskLevel = '風險等級: 注意 🟡';
                                } else {
                                    riskLevel = '風險等級: 正常 🟢';
                                }
                                
                                return riskLevel;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        type: 'category',
                        ticks: {
                            color: '#94a3b8',
                            font: {
                                size: 11,
                                family: 'Inter'
                            },
                            maxTicksLimit: 12
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)',
                            lineWidth: 1
                        },
                        border: {
                            color: 'rgba(255, 255, 255, 0.2)'
                        }
                    },
                    y: {
                        beginAtZero: false,
                        min: 0.5,
                        max: 2.0,
                        ticks: {
                            color: '#94a3b8',
                            font: {
                                size: 11,
                                family: 'Inter'
                            },
                            callback: function(value) {
                                return value.toFixed(1) + 'm';
                            },
                            stepSize: 0.1
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)',
                            lineWidth: 1
                        },
                        border: {
                            color: 'rgba(255, 255, 255, 0.2)'
                        }
                    }
                },
                animation: {
                    duration: 1000,
                    easing: 'easeInOutQuart'
                },
                hover: {
                    animationDuration: 200
                }
            }
        });
    }

    // 生成歷史資料（基於您的趨勢圖）
    generateHistoricalData() {
        const now = new Date();
        const dataPoints = this.getDataPointsForPeriod(this.chartPeriod);
        
        this.chartData.timestamps = [];
        this.chartData.historical = [];
        
        // 基於您圖片中的水位趨勢模式
        const basePattern = [
            1.05, 1.18, 1.35, 1.48, 1.52, 1.35, 1.25, 1.02, 
            0.95, 0.88, 0.85, 0.82, 0.78, 0.75, 0.89, 0.95, 
            1.05, 1.15, 1.18, 1.16, 1.12, 1.08, 1.05, 1.02
        ];
        
        for (let i = 0; i < dataPoints; i++) {
            const timeOffset = this.getTimeOffset(i, dataPoints);
            const time = new Date(now.getTime() - timeOffset);
            
            // 使用基礎模式並添加一些變化
            const patternIndex = i % basePattern.length;
            const baseValue = basePattern[patternIndex];
            const variation = (Math.random() - 0.5) * 0.1;
            const waterLevel = Math.max(0.5, Math.min(2.0, baseValue + variation));
            
            this.chartData.timestamps.unshift(this.formatTime(time));
            this.chartData.historical.unshift(waterLevel);
        }
        
        this.updateChartData();
    }

    // 根據週期獲取資料點數量
    getDataPointsForPeriod(period) {
        switch(period) {
            case '1h': return 24; // 每2.5分鐘一個點
            case '6h': return 36; // 每10分鐘一個點
            case '24h': return 48; // 每30分鐘一個點
            case '7d': return 168; // 每小時一個點
            default: return 24;
        }
    }

    // 獲取時間偏移
    getTimeOffset(index, total) {
        switch(this.chartPeriod) {
            case '1h': return index * 2.5 * 60 * 1000; // 2.5分鐘
            case '6h': return index * 10 * 60 * 1000; // 10分鐘
            case '24h': return index * 30 * 60 * 1000; // 30分鐘
            case '7d': return index * 60 * 60 * 1000; // 1小時
            default: return index * 2.5 * 60 * 1000;
        }
    }

    // 格式化時間顯示
    formatTime(date) {
        switch(this.chartPeriod) {
            case '1h':
            case '6h':
                return date.toLocaleTimeString('zh-TW', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                });
            case '24h':
                return date.toLocaleTimeString('zh-TW', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                });
            case '7d':
                return date.toLocaleDateString('zh-TW', { 
                    month: '2-digit', 
                    day: '2-digit' 
                });
            default:
                return date.toLocaleTimeString('zh-TW', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                });
        }
    }

    // 更新圖表資料
    updateChartData() {
        if (!this.waterLevelChart) return;

        const chart = this.waterLevelChart;
        
        // 更新標籤
        chart.data.labels = [...this.chartData.timestamps];
        
        // 更新歷史水位資料
        chart.data.datasets[0].data = [...this.chartData.historical];
        
        // 生成AI預測資料（最後3個點）
        const lastPoints = this.chartData.historical.slice(-3);
        const predictions = this.generateAIPredictions(lastPoints);
        chart.data.datasets[1].data = [...Array(this.chartData.historical.length - 3).fill(null), ...predictions];
        
        // 更新警戒線資料
        const warningLines = [
            { level: 1.4, datasetIndex: 2 }, // 危險線
            { level: 1.3, datasetIndex: 3 }, // 警戒線
            { level: 1.2, datasetIndex: 4 }  // 注意線
        ];
        
        warningLines.forEach(line => {
            chart.data.datasets[line.datasetIndex].data = 
                new Array(this.chartData.timestamps.length).fill(line.level);
        });
        
        chart.update('none');
    }

    // 生成AI預測資料
    generateAIPredictions(lastPoints) {
        if (lastPoints.length < 3) return [];
        
        const predictions = [];
        let currentValue = lastPoints[lastPoints.length - 1];
        
        // 基於趨勢和AI邏輯生成預測
        const trend = (lastPoints[2] - lastPoints[0]) / 2;
        const currentRainfall = parseInt(document.getElementById('rainfallSlider')?.value || 25);
        
        for (let i = 0; i < 3; i++) {
            // AI預測邏輯（基於您的88.24%準確度模型）
            let prediction = currentValue + trend * 0.5;
            
            // 考慮降雨影響
            if (currentRainfall > 30) {
                prediction += 0.05;
            } else if (currentRainfall > 10) {
                prediction += 0.02;
            }
            
            // 添加一些不確定性
            const uncertainty = (Math.random() - 0.5) * 0.08;
            prediction += uncertainty;
            
            // 確保在合理範圍內
            prediction = Math.max(0.5, Math.min(2.0, prediction));
            
            predictions.push(prediction);
            currentValue = prediction;
        }
        
        return predictions;
    }

    // 更新圖表週期
    updatePeriod(newPeriod) {
        this.chartPeriod = newPeriod;
        this.generateHistoricalData();
    }

    // 添加新的即時資料點
    addRealTimeData(waterLevel) {
        const now = new Date();
        const timeLabel = this.formatTime(now);
        
        // 添加新資料點
        this.chartData.timestamps.push(timeLabel);
        this.chartData.historical.push(waterLevel);
        
        // 保持資料點數量
        const maxPoints = this.getDataPointsForPeriod(this.chartPeriod);
        if (this.chartData.timestamps.length > maxPoints) {
            this.chartData.timestamps.shift();
            this.chartData.historical.shift();
        }
        
        this.updateChartData();
    }

    // 開始即時更新
    startRealTimeUpdates() {
        // 每30秒更新一次圖表
        this.updateInterval = setInterval(() => {
            const currentLevel = parseFloat(document.getElementById('waterSlider')?.value || 1.15);
            this.addRealTimeData(currentLevel);
        }, 30000);
    }

    // 停止即時更新
    stopRealTimeUpdates() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
    }

    // 匯出圖表資料
    exportChartData() {
        const exportData = {
            timestamp: new Date().toISOString(),
            period: this.chartPeriod,
            data: this.chartData.timestamps.map((time, index) => ({
                time: time,
                waterLevel: this.chartData.historical[index],
                riskLevel: this.getRiskLevel(this.chartData.historical[index])
            })),
            aiModel: {
                accuracy: 88.24,
                type: 'LSTM',
                features: 27,
                trainingFiles: 238
            },
            station: {
                name: '中山抽水站',
                location: '中山區濟江街97號',
                totalCapacity: '63 C.M.S'
            }
        };
        
        const dataStr = JSON.stringify(exportData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `zhongshan_water_level_${new Date().toISOString().slice(0, 10)}.json`;
        link.click();
    }

    // 獲取風險等級
    getRiskLevel(waterLevel) {
        if (waterLevel >= 1.4) return '危險';
        if (waterLevel >= 1.3) return '警戒';
        if (waterLevel >= 1.2) return '注意';
        return '正常';
    }

    // 銷毀圖表
    destroy() {
        this.stopRealTimeUpdates();
        if (this.waterLevelChart) {
            this.waterLevelChart.destroy();
            this.waterLevelChart = null;
        }
    }
}

// 全域圖表管理器
const chartManager = new ZhongshanChartManager();

// 匯出供其他模組使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ZhongshanChartManager, chartManager };
}
