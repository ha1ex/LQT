// Скрипт для принудительной загрузки данных
console.log('🔄 Принудительная загрузка данных...');

// Очищаем localStorage
localStorage.clear();
console.log('🗑️ localStorage очищен');

// Создаем данные вручную
const createData = () => {
  console.log('📝 Создаем данные...');
  
  // Q1 данные (W08-W14)
  const q1Data = {
    '2024-02-19': {
      id: '2024-02-19',
      weekNumber: 8,
      startDate: '2024-02-19T00:00:00.000Z',
      endDate: '2024-02-25T00:00:00.000Z',
      ratings: {
        peace_of_mind: 4,
        financial_cushion: 3,
        income: 4,
        wife_communication: 4,
        family_communication: 7,
        physical_health: 6,
        socialization: 6,
        manifestation: 10,
        travel: 1,
        mental_health: 1
      },
      overallScore: 4.6,
      mood: 'neutral',
      notes: {},
      keyEvents: [],
      weather: undefined,
      createdAt: '2024-02-19T00:00:00.000Z',
      updatedAt: '2024-02-19T00:00:00.000Z'
    },
    '2024-02-26': {
      id: '2024-02-26',
      weekNumber: 9,
      startDate: '2024-02-26T00:00:00.000Z',
      endDate: '2024-03-03T00:00:00.000Z',
      ratings: {
        peace_of_mind: 7,
        financial_cushion: 4,
        income: 6,
        wife_communication: 7,
        family_communication: 9,
        physical_health: 7,
        socialization: 7,
        manifestation: 10,
        travel: 1,
        mental_health: 1
      },
      overallScore: 5.9,
      mood: 'good',
      notes: {},
      keyEvents: [],
      weather: undefined,
      createdAt: '2024-02-26T00:00:00.000Z',
      updatedAt: '2024-02-26T00:00:00.000Z'
    }
  };

  // Q2 данные (W15-W22)
  const q2Data = {
    '2024-04-08': {
      id: '2024-04-08',
      weekNumber: 15,
      startDate: '2024-04-08T00:00:00.000Z',
      endDate: '2024-04-14T00:00:00.000Z',
      ratings: {
        peace_of_mind: 7,
        financial_cushion: 4,
        income: 6,
        wife_communication: 4,
        family_communication: 7,
        physical_health: 6,
        socialization: 9,
        manifestation: 7,
        travel: 7,
        mental_health: 6
      },
      overallScore: 6.1,
      mood: 'good',
      notes: {},
      keyEvents: [],
      weather: undefined,
      createdAt: '2024-04-08T00:00:00.000Z',
      updatedAt: '2024-04-08T00:00:00.000Z'
    },
    '2024-04-15': {
      id: '2024-04-15',
      weekNumber: 16,
      startDate: '2024-04-15T00:00:00.000Z',
      endDate: '2024-04-21T00:00:00.000Z',
      ratings: {
        peace_of_mind: 9,
        financial_cushion: 4,
        income: 7,
        wife_communication: 10,
        family_communication: 11,
        physical_health: 4,
        socialization: 10,
        manifestation: 9,
        travel: 9,
        mental_health: 7
      },
      overallScore: 8.2,
      mood: 'excellent',
      notes: {},
      keyEvents: [],
      weather: undefined,
      createdAt: '2024-04-15T00:00:00.000Z',
      updatedAt: '2024-04-15T00:00:00.000Z'
    }
  };

  // Объединяем данные
  const allData = { ...q1Data, ...q2Data };
  
  // Сохраняем в localStorage
  localStorage.setItem('lqt_weekly_ratings', JSON.stringify(allData));
  console.log('✅ Данные сохранены в localStorage');
  console.log('📊 Количество недель:', Object.keys(allData).length);
  
  return allData;
};

// Выполняем загрузку
const data = createData();
console.log('🎉 Данные загружены успешно!');
console.log('📅 Доступные недели:', Object.keys(data));

// Перезагружаем страницу через 2 секунды
setTimeout(() => {
  console.log('🔄 Перезагружаем страницу...');
  window.location.reload();
}, 2000); 