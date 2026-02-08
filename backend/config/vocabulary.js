/**
 * 词汇库 - 各主题/场景的预置词汇
 * Vocabulary Database - Pre-built vocabulary for different themes/scenes
 */

const vocabulary = {
  supermarket: {
    core: [
      'shōu yín yuán 收银员',
      'huò jià 货架',
      'gòu wù chē 购物车',
      'jiǎn suǎn tái 收银台'
    ],
    items: [
      'píng guǒ 苹果',
      'niú nǎi 牛奶',
      'miàn bāo 面包',
      'yī fu 衣服',
      'shuǐ guǒ 水果',
      'shū cài 蔬菜',
      'dàn 鸡蛋',
      'guǒ zhī 果汁'
    ],
    environment: [
      'chū kǒu 出口',
      'rù kǒu 入口',
      'dēng 灯',
      'qiáng 墙',
      'zhǐ tiáo 指示牌'
    ]
  },

  hospital: {
    core: [
      'yī shēng 医生',
      'hù shì 护士',
      'yī yuàn 医院',
      'bìng chuáng 病床'
    ],
    items: [
      'yào 药',
      'tǐ wēn jǐ 体温计',
      'tīng zhěn qì 听诊器',
      'bēng dài 绷带',
      'yī shǒu zhēn 医用手套',
      'yào xiāng 药箱',
      'zhēn 针',
      'yā suō jǐ 压缩机'
    ],
    environment: [
      'zhěn shì 诊室',
      'yào fáng 药房',
      'zǒu láng 走廊',
      'mén 门',
      'chuāng 窗'
    ]
  },

  park: {
    core: [
      'shù 树',
      'huā 花',
      'cǎo 草',
      'gōng yuán 公园'
    ],
    items: [
      'qiū qiān 秋千',
      'huá tī 滑梯',
      'dǎn qiū qiān 荡秋千',
      'yǐ zi 椅子',
      'shuǐ chí 水池',
      'niǎo 鸟',
      'hú dié 蝴蝶',
      'qiú 球'
    ],
    environment: [
      'lù 路',
      'shān 山',
      'hé 河',
      'qiáo 桥',
      'tiān kōng 天空'
    ]
  },

  school: {
    core: [
      'lǎo shī 老师',
      'xué shēng 学生',
      'jiào shì 教室',
      'hēi bǎn 黑板'
    ],
    items: [
      'shū 书',
      'bǐ 笔',
      'běn zi 本子',
      'zhuō zi 桌子',
      'yǐ zi 椅子',
      'bāo 书包',
      'chǐ 尺',
      'xiàng pí 橡皮'
    ],
    environment: [
      'mén 门',
      'chuāng 窗',
      'qiáng 墙',
      'dēng 灯',
      'bù 布告栏'
    ]
  },

  zoo: {
    core: [
      'shī zi 狮子',
      'dà xiàng 大象',
      'hóu zi 猴子',
      'dòng wù yuán 动物园'
    ],
    items: [
      'lǎo hǔ 老虎',
      'cháng jǐng lù 长颈鹿',
      'xióng māo 熊猫',
      'kǒng què 孔雀',
      'tuó niǎo 鸵鸟',
      'ping fēn 企鹅',
      'hǎi tún 海豚',
      'wū guī 乌龟'
    ],
    environment: [
      'lóng zi 笼子',
      'shuǐ chí 水池',
      'shù 树',
      'cǎo 草',
      'lù 路'
    ]
  },

  kitchen: {
    core: [
      'chú fáng 厨房',
      'guō 锅',
      'pán 盘',
      'zhuō zi 桌子'
    ],
    items: [
      'dāo 刀',
      'chā 叉',
      'kuài zi 筷子',
      'wǎn 碗',
      'shuǐ hú 水壶',
      'bēi zi 杯子',
      'guō shào 锅勺',
      'cài 菜'
    ],
    environment: [
      'chú guì 橱柜',
      'zào tái 灶台',
      'shuǐ lóng tóu 水龙头',
      'qiáng 墙',
      'chuāng 窗'
    ]
  },

  bedroom: {
    core: [
      'chuáng 床',
      'zhěn tou 枕头',
      'bèi zi 被子',
      'wò shì 卧室'
    ],
    items: [
      'xiāng zi 箱子',
      'yī guì 衣柜',
      'dēng 灯',
      'shū zhuō 书桌',
      'yǐ zi 椅子',
      'jìng zi 镜子',
      'huà huà 画画',
      'wán jù 玩具'
    ],
    environment: [
      'mén 门',
      'chuāng 窗',
      'qiáng 墙',
      'dì 地',
      'tiān huā bǎn 天花板'
    ]
  },

  playground: {
    core: [
      'yóu lè chǎng 游乐场',
      'qiū qiān 秋千',
      'huá tī 滑梯',
      'dān gàng 单杠'
    ],
    items: [
      'pán qiū qiān 攀秋千',
      'qí mǎ 骑马',
      'huá lún 滑轮',
      'bèng bèng chù 蹦蹦床',
      'qí qián 骑钱',
      'wán jù 玩具',
      'qiú 球',
      'dǎn dàn 蛋蛋'
    ],
    environment: [
      'dì 地',
      'shù 树',
      'lù 路',
      'qiáng 墙',
      'zhào péng 罩棚'
    ]
  },

  library: {
    core: [
      'tú shū guǎn 图书馆',
      'shū jià 书架',
      'shū 书',
      'guǎn lǐ yuán 管理员'
    ],
    items: [
      'kān shū 看书',
      'bǐ 笔',
      'běn zi 本子',
      'diàn nǎo 电脑',
      'zhuō zi 桌子',
      'yǐ zi 椅子',
      'shū bāo 书包',
      'bān zhī 板纸'
    ],
    environment: [
      'mén 门',
      'chuāng 窗',
      'qiáng 墙',
      'dēng 灯',
      'lù 路'
    ]
  },

  transportation: {
    core: [
      'chē 车',
      'gōng jiāo chē 公交车',
      'diàn tiē 地铁',
      'huǒ chē 火车'
    ],
    items: [
      'chē zhàn 车站',
      'zhào xiàng 照相',
      'dēng 灯',
      'zhǐ tiáo 指示牌',
      'qiáo 桥',
      'lù 路',
      'jiāo tōng 交通',
      'xíng 行'
    ],
    environment: [
      'tiān 天空',
      'qiáng 墙',
      'dì 地',
      'shù 树',
      'hé 河'
    ]
  }
};

module.exports = vocabulary;
