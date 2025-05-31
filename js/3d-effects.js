// 3D視覺效果與粒子系統
class Visual3DEffects {
    constructor() {
        this.particles = [];
        this.neuralConnections = [];
        this.isInitialized = false;
    }

    init() {
        this.createParticleSystem();
        this.initNeuralNetwork();
        this.startAnimationLoop();
        this.isInitialized = true;
    }

    // 粒子系統
    createParticleSystem() {
        const particleContainer = document.getElementById('particleBackground');
        if (!particleContainer) return;

        // 清空現有粒子
        particleContainer.innerHTML = '';

        // 創建50個粒子
        for (let i = 0; i < 50; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            
            // 隨機位置
            particle.style.left = Math.random() * 100 + '%';
            particle.style.animationDelay = Math.random() * 20 + 's';
            particle.style.animationDuration = (15 + Math.random() * 10) + 's';
            
            // 隨機大小
            const size = 1 + Math.random() * 3;
            particle.style.width = size + 'px';
            particle.style.height = size + 'px';
            
            // 隨機透明度
            particle.style.opacity = 0.1 + Math.random() * 0.3;
            
            particleContainer.appendChild(particle);
            this.particles.push(particle);
        }
    }

    // 神經網路視覺化
    initNeuralNetwork() {
        const neuralContainer = document.querySelector('.neural-connections');
        if (!neuralContainer) return;

        // 清空現有連接
        neuralContainer.innerHTML = '';

        // 創建神經元連接線
        const connections = [
            { from: { x: 50, y: 100 }, to: { x: 150, y: 80 } },
            { from: { x: 50, y: 150 }, to: { x: 150, y: 120 } },
            { from: { x: 50, y: 200 }, to: { x: 150, y: 160 } },
            { from: { x: 150, y: 80 }, to: { x: 250, y: 140 } },
            { from: { x: 150, y: 120 }, to: { x: 250, y: 140 } },
            { from: { x: 150, y: 160 }, to: { x: 250, y: 140 } }
        ];

        connections.forEach((conn, index) => {
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', conn.from.x);
            line.setAttribute('y1', conn.from.y);
            line.setAttribute('x2', conn.to.x);
            line.setAttribute('y2', conn.to.y);
            line.setAttribute('stroke', 'url(#connectionGradient)');
            line.setAttribute('stroke-width', '2');
            line.style.animationDelay = index * 0.2 + 's';
            line.classList.add('neural-connection');
            
            neuralContainer.appendChild(line);
        });
    }

    // 更新水位3D效果
    updateWaterLevel3D(level) {
        const waterLevel3D = document.getElementById('waterLevel3D');
        if (!waterLevel3D) return;

        const heightPercent = (level / 2.5) * 100;
        waterLevel3D.style.height = heightPercent + '%';

        // 更新波浪動畫速度
        const waves = waterLevel3D.querySelectorAll('.wave');
        waves.forEach((wave, index) => {
            const speed = 2 + (level * 0.5);
            wave.style.animationDuration = speed + 's';
        });

        // 更新數位顯示
        const digitalLevel = document.getElementById('digitalLevel');
        if (digitalLevel) {
            digitalLevel.textContent = level.toFixed(2);
        }
    }

    // 創建抽水機3D卡片
    createPump3DCard(pump, isActive, isRecommended) {
        const card = document.createElement('div');
        card.className = `pump-card-3d ${isActive ? 'active' : ''} ${isRecommended ? 'recommended' : ''}`;
        card.dataset.pumpId = pump.id;

        card.innerHTML = `
            <div class="pump-card-inner">
                <div class="pump-card-front">
                    <div class="pump-header">
                        <div class="pump-id">#${pump.id}</div>
                        <div class="pump-status-indicator ${isActive ? 'active' : isRecommended ? 'recommended' : 'standby'}"></div>
                    </div>
                    <div class="pump-model">${pump.brand} ${pump.model}</div>
                    <div class="pump-specs">
                        <div class="spec-item">
                            <span class="spec-label">功率</span>
                            <span class="spec-value">${pump.power}kW</span>
                        </div>
                        <div class="spec-item">
                            <span class="spec-label">容量</span>
                            <span class="spec-value">${pump.capacity} C.M.S</span>
                        </div>
                    </div>
                    <div class="pump-visual">
                        <div class="pump-icon">
                            <i class="fas fa-cog ${isActive ? 'spinning' : ''}"></i>
                        </div>
                    </div>
                </div>
                <div class="pump-card-back">
                    <div class="detailed-specs">
                        <h4>詳細規格</h4>
                        <div class="spec-grid">
                            <div class="spec-row">
                                <span>引擎:</span>
                                <span>${pump.engine}</span>
                            </div>
                            <div class="spec-row">
                                <span>口徑:</span>
                                <span>${pump.diameter}mm</span>
                            </div>
                            <div class="spec-row">
                                <span>轉速:</span>
                                <span>${pump.rpm}rpm</span>
                            </div>
                            <div class="spec-row">
                                <span>啟動:</span>
                                <span>${pump.autoStart}m</span>
                            </div>
                            <div class="spec-row">
                                <span>停止:</span>
                                <span>${pump.autoStop}m</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // 添加點擊事件
        card.addEventListener('click', () => {
            this.togglePumpAnimation(card);
        });

        return card;
    }

    // 切換抽水機動畫
    togglePumpAnimation(card) {
        const isActive = card.classList.contains('active');
        const pumpIcon = card.querySelector('.pump-icon i');
        
        if (isActive) {
            card.classList.remove('active');
            pumpIcon.classList.remove('spinning');
        } else {
            card.classList.add('active');
            pumpIcon.classList.add('spinning');
        }

        // 添加點擊波紋效果
        this.createRippleEffect(card);
    }

    // 創建波紋效果
    createRippleEffect(element) {
        const ripple = document.createElement('div');
        ripple.className = 'ripple-effect';
        
        const rect = element.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        
        ripple.style.width = size + 'px';
        ripple.style.height = size + 'px';
        ripple.style.left = '50%';
        ripple.style.top = '50%';
        ripple.style.transform = 'translate(-50%, -50%)';
        
        element.appendChild(ripple);
        
        // 移除波紋效果
        setTimeout(() => {
            if (ripple.parentNode) {
                ripple.parentNode.removeChild(ripple);
            }
        }, 600);
    }

    // 更新神經網路活動
    updateNeuralActivity(confidence) {
        const neurons = document.querySelectorAll('.neuron');
        const connections = document.querySelectorAll('.neural-connection');
        
        // 更新神經元活動
        neurons.forEach((neuron, index) => {
            const activity = confidence / 100;
            const delay = index * 100;
            
            setTimeout(() => {
                neuron.style.opacity = 0.3 + (activity * 0.7);
                neuron.style.transform = `scale(${0.8 + activity * 0.4})`;
            }, delay);
        });

        // 更新連接線活動
        connections.forEach((connection, index) => {
            const delay = index * 50;
            setTimeout(() => {
                connection.style.strokeOpacity = confidence / 100;
            }, delay);
        });
    }

    // 創建狀態指示器動畫
    animateStatusIndicator(element, status) {
        element.classList.remove('normal', 'caution', 'warning', 'danger', 'emergency');
        element.classList.add(status);

        // 添加脈衝動畫
        if (status === 'danger' || status === 'emergency') {
            element.style.animation = 'statusPulse 1s ease-in-out infinite';
        } else {
            element.style.animation = 'none';
        }
    }

    // 創建水位變化動畫
    animateWaterLevelChange(fromLevel, toLevel, duration = 1000) {
        const waterElement = document.querySelector('.water-level');
        if (!waterElement) return;

        const fromHeight = (fromLevel / 2.5) * 100;
        const toHeight = (toLevel / 2.5) * 100;
        
        let startTime = null;
        
        const animate = (currentTime) => {
            if (!startTime) startTime = currentTime;
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // 使用緩動函數
            const easeProgress = this.easeOutQuart(progress);
            const currentHeight = fromHeight + (toHeight - fromHeight) * easeProgress;
            
            waterElement.style.height = currentHeight + '%';
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        
        requestAnimationFrame(animate);
    }

    // 緩動函數
    easeOutQuart(t) {
        return 1 - Math.pow(1 - t, 4);
    }

    // 開始動畫循環
    startAnimationLoop() {
        const animate = () => {
            // 更新粒子位置
            this.updateParticles();
            
            // 更新神經網路動畫
            this.updateNeuralConnections();
            
            requestAnimationFrame(animate);
        };
        
        animate();
    }

    // 更新粒子
    updateParticles() {
        // 粒子動畫由CSS處理，這裡可以添加額外的互動效果
    }

    // 更新神經網路連接
    updateNeuralConnections() {
        const connections = document.querySelectorAll('.neural-connection');
        connections.forEach((connection, index) => {
            const time = Date.now() * 0.001;
            const opacity = 0.3 + Math.sin(time + index) * 0.3;
            connection.style.strokeOpacity = Math.max(0.1, opacity);
        });
    }

    // 銷毀效果
    destroy() {
        this.particles = [];
        this.neuralConnections = [];
        this.isInitialized = false;
    }
}

// 全域3D效果實例
const visual3D = new Visual3DEffects();

// 當DOM載入完成時初始化
document.addEventListener('DOMContentLoaded', () => {
    visual3D.init();
});

// 匯出供其他模組使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Visual3DEffects, visual3D };
}
