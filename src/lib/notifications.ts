export function getNotifications() {
    return [
      {
        id: 1,
        type: 'challenge',
        title: 'تحدي جديد',
        description: 'لقد أكملت تحدي \"يوم بلا سيارة\". أحسنت!',
        timestamp: 'منذ 5 دقائق',
        read: false,
      },
      {
        id: 2,
        type: 'recommendation',
        title: 'توصية جديدة',
        description: 'نقترح عليك تجربة \"التسميد في المنزل\".',
        timestamp: 'منذ 30 دقائق',
        read: false,
      },
      {
        id: 3,
        type: 'reward',
        title: 'لقد ربحت مكافأة',
        description: 'لقد حصلت على شارة \"صديق البيئة\".',
        timestamp: 'منذ 1 ساعة',
        read: true,
      },
      {
        id: 4,
        type: 'challenge',
        title: 'تذكير بالتحدي',
        description: 'لا تنس إكمال تحدي \"زراعة شجرة\" اليوم.',
        timestamp: 'منذ 3 ساعات',
        read: true,
      },
    ];
  }
  