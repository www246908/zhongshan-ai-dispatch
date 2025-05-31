// 基於您的官方規格表的中山抽水站配置
const ZHONGSHAN_STATION_CONFIG = {
    // 基本資訊
    stationInfo: {
        name: '中山抽水站',
        location: '中山區濟江街97號',
        phone: '2505-3676',
        drainageLength: 2800,    // m (排水幹線長度)
        catchmentArea: 536,      // 公頃 (集水面積)
        managementArea: 0.075,   // 公頃 (管理用地)
        totalCapacity: 63        // C.M.S (總抽水量)
    },

    // 抽水機配置 (根據您的規格表)
    pumps: [
        {
            id: 1,
            model: 'PNZ1650-1440',
            brand: 'KSB',
            capacity: 6.5,      // C.M.S
            power: 783,         // kW
            horsepower: 1050,
            diameter: 1650,     // mm
            engine: 'Cummits QST30',
            rpm: 1800,
            autoStart: 1.2,     // m (自動啟動)
            autoStop: 1.1,      // m (自動停止)
            fuelTank: 700       // L (日用油槽)
        },
        {
            id: 2,
            model: 'PNZ1650-1440',
            brand: 'KSB',
            capacity: 6.5,
            power: 783,
            horsepower: 1050,
            diameter: 1650,
            engine: 'Cummits QST30',
            rpm: 1800,
            autoStart: 1.2,
            autoStop: 1.1,
            fuelTank: 700
        },
        {
            id: 3,
            model: 'PN2000-1540',
            brand: 'KSB',
            capacity: 10,
            power: 1007,
            horsepower: 1350,
            diameter: 2000,
            engine: 'Cummits QSK45-C2000',
            rpm: 1500,
            autoStart: 1.3,
            autoStop: 1.1,
            fuelTank: 700
        },
        {
            id: 4,
            model: 'PN2000-1540',
            brand: 'KSB',
            capacity: 10,
            power: 1007,
            horsepower: 1350,
            diameter: 2000,
            engine: 'Cummits QSK45-C2000',
            rpm: 1500,
            autoStart: 1.3,
            autoStop: 1.0,
            fuelTank: 700
        },
        {
            id: 5,
            model: 'PN2000-1540',
            brand: 'KSB',
            capacity: 10,
            power: 1007,
            horsepower: 1350,
            diameter: 2000,
            engine: 'Cummits QSK45-C2000',
            rpm: 1500,
            autoStart: 1.3,
            autoStop: 1.0,
            fuelTank: 700
        },
        {
            id: 6,
            model: 'PN2000-1540',
            brand: 'KSB',
            capacity: 10,
            power: 1007,
            horsepower: 1350,
            diameter: 2000,
            engine: 'Cummits QSK45-C2000',
            rpm: 1500,
            autoStart: 1.4,
            autoStop: 1.0,
            fuelTank: 700
        },
        {
            id: 7,
            model: 'PN2000-1540',
            brand: 'KSB',
            capacity: 10,
            power: 1007,
            horsepower: 1350,
            diameter: 2000,
            engine: 'Cummits QSK45-C2000',
            rpm: 1500,
            autoStart: 1.4,
            autoStop: 1.0,
            fuelTank: 700
        }
    ],

    // 燃料系統 (根據規格表)
    fuelSystem: {
        emergencyTank: 110000,   // L (緊急備用油槽)
        dailyTanks: 4900,        // L (日用油槽總計 7×700)
        emergencyOilTank1: 800,  // L (1號緊急機油槽)
        emergencyOilTank2: 800   // L (2號緊急機油槽)
    },

    // 發電機系統 (根據規格表)
    generator: {
        installDate: '102.10.16',
        engineBrand: 'M.A.N',
        engineModel: 'D2840LE201',
        generatorBrand: 'PILLAR JM-500',
        generatorModel: 'PL-500-MD',
        power: 500,              // kW
        horsepower: 670
    },

    // 減速機系統
    gearbox: {
        type: 'PTV',
        ratio1: 6.0,
        ratio2: 5.7
    },

    // 電力系統
    electrical: {
        pumpCurrent: '200AH×8',
        generatorCurrent: '200AH×4',
        controlPanel: {
            capacity: 220,
            installDate: '90.5.10'
        }
    },

    // AI系統配置 (基於您的notebook結果)
    aiSystem: {
        accuracy: 88.24,         // % (調度策略準確度)
        modelType: 'LSTM',
        waterLevelR2: 0.8734,
        rmse: 0.2183,
        mae: 0.1516,
        trainingFiles: 238,
        features: 27
    }
};

// 風險等級定義
const RISK_LEVELS = {
    NORMAL: { min: 0, max: 1.2, color: '#10b981', label: '正常' },
    CAUTION: { min: 1.2, max: 1.3, color: '#f59e0b', label: '注意' },
    WARNING: { min: 1.3, max: 1.4, color: '#f97316', label: '警戒' },
    DANGER: { min: 1.4, max: 3.0, color: '#ef4444', label: '危險' }
};
