import fs from 'fs';

// 151 Kanto Pokemon Base List with authentic Chinese data
const kantoData = [
  { id: 1, name: '妙蛙种子', nameEn: 'Bulbasaur', nameJp: 'フシギダネ', genus: '种子宝可梦', types: ['草', '毒'], height: 0.7, weight: 6.9, desc: '背上的种子长大后，会开出大大的花朵。', color: '#78C850', cryName: '种子种子！' },
  { id: 2, name: '妙蛙草', nameEn: 'Ivysaur', nameJp: 'フシギソウ', genus: '种子宝可梦', types: ['草', '毒'], height: 1.0, weight: 13.0, desc: '背上的花苞吸收养分后，就会散发出甜甜的香气。', color: '#78C850' },
  { id: 3, name: '妙蛙花', nameEn: 'Venusaur', nameJp: 'フシギバナ', genus: '花宝可梦', types: ['草', '毒'], height: 2.0, weight: 100.0, desc: '花朵散发出的香气能抚平人的情绪，在雨天后香味更浓。', color: '#78C850' },
  { id: 4, name: '小火龙', nameEn: 'Charmander', nameJp: 'ヒトカゲ', genus: '蜥蜴宝可梦', types: ['火'], height: 0.6, weight: 8.5, desc: '尾巴上的火焰代表它的生命力。如果火焰熄灭，生命就会终结。', color: '#F08030', cryName: '火龙火龙！' },
  { id: 5, name: '火恐龙', nameEn: 'Charmeleon', nameJp: 'リザード', genus: '火焰宝可梦', types: ['火'], height: 1.1, weight: 19.0, desc: '挥舞锋利的爪子撕碎敌人。遇到强敌时尾巴的火焰会变成蓝白色。', color: '#F08030' },
  { id: 6, name: '喷火龙', nameEn: 'Charizard', nameJp: 'リザードン', genus: '火焰宝可梦', types: ['火', '飞行'], height: 1.7, weight: 90.5, desc: '能用强力的翅膀在空中飞翔，喷出的高温烈焰能融化岩石。', color: '#F08030', cryName: '吼——！' },
  { id: 7, name: '杰尼龟', nameEn: 'Squirtle', nameJp: 'ゼニガメ', genus: '小龟宝可梦', types: ['水'], height: 0.5, weight: 9.0, desc: '甲壳不仅用来保护身体，圆润的形状还能减少水阻，快速游泳。', color: '#6890F0', cryName: '杰尼杰尼！' },
  { id: 8, name: '卡咪龟', nameEn: 'Wartortle', nameJp: 'カメール', genus: '龟宝可梦', types: ['水'], height: 1.0, weight: 22.5, desc: '长满毛的长尾巴是长寿的象征，在老人们中间非常受欢迎。', color: '#6890F0' },
  { id: 9, name: '水箭龟', nameEn: 'Blastoise', nameJp: 'カメックス', genus: '甲壳宝可梦', types: ['水'], height: 1.6, weight: 85.5, desc: '背上的两门水炮喷出的水流力道极强，可以贯穿厚厚的钢板。', color: '#6890F0' },
  { id: 10, name: '绿毛虫', nameEn: 'Caterpie', nameJp: 'キャタピー', genus: '毛毛虫宝可梦', types: ['虫'], height: 0.3, weight: 2.9, desc: '从头部的触角散发出强烈的臭气来驱赶敌人保护自己。', color: '#A8B820' },
  { id: 11, name: '铁甲蛹', nameEn: 'Metapod', nameJp: 'トランセル', genus: '蛹宝可梦', types: ['虫'], height: 0.7, weight: 9.9, desc: '外壳像钢铁一样坚硬，正在壳内准备进化成漂亮的形态。', color: '#A8B820' },
  { id: 12, name: '巴大蝶', nameEn: 'Butterfree', nameJp: 'バタフリー', genus: '蝴蝶宝可梦', types: ['虫', '飞行'], height: 1.1, weight: 32.0, desc: '翅膀上附着有毒的磷粉，扇动翅膀就能在狂风中播撒毒粉。', color: '#A8B820' },
  { id: 13, name: '独角虫', nameEn: 'Weedle', nameJp: 'ビードル', genus: '毛虫宝可梦', types: ['虫', '毒'], height: 0.3, weight: 3.2, desc: '头顶有一根尖锐的毒针，即使很小也不可小觑。', color: '#A8B820' },
  { id: 14, name: '铁壳蛹', nameEn: 'Kakuna', nameJp: 'コクーン', genus: '蛹宝可梦', types: ['虫', '毒'], height: 0.6, weight: 10.0, desc: '虽然几乎一动不动，但一旦受到外界刺激外壳就会变得极其坚硬。', color: '#A8B820' },
  { id: 15, name: '大针蜂', nameEn: 'Beedrill', nameJp: 'スピアー', genus: '毒蜂宝可梦', types: ['虫', '毒'], height: 1.0, weight: 29.5, desc: '双手和尾部都有强烈的剧毒毒针，领地意识极强。', color: '#A8B820' },
  { id: 16, name: '波波', nameEn: 'Pidgey', nameJp: 'ポッポ', genus: '小鸟宝可梦', types: ['一般', '飞行'], height: 0.3, weight: 1.8, desc: '性格温和，经常扇起沙尘把敌人迷住然后逃之夭夭。', color: '#A8A878' },
  { id: 17, name: '比比鸟', nameEn: 'Pidgeotto', nameJp: 'ピジョン', genus: '鸟宝可梦', types: ['一般', '飞行'], height: 1.1, weight: 30.0, desc: '视力极好，能在高空中清晰看到草丛中游荡的猎物。', color: '#A8A878' },
  { id: 18, name: '大比鸟', nameEn: 'Pidgeot', nameJp: 'ピジョット', genus: '鸟宝可梦', types: ['一般', '飞行'], height: 1.5, weight: 39.5, desc: '羽毛华丽，展开翅膀能在两马赫的高空中翱翔。', color: '#A8A878' },
  { id: 19, name: '小拉达', nameEn: 'Rattata', nameJp: 'コラッタ', genus: '鼠宝可梦', types: ['一般'], height: 0.3, weight: 3.5, desc: '牙齿一辈子都在生长，因此会不断啃咬坚硬的物体磨牙。', color: '#A8A878' },
  { id: 20, name: '拉达', nameEn: 'Raticate', nameJp: 'ラッタ', genus: '鼠宝可梦', types: ['一般'], height: 0.7, weight: 18.5, desc: '后脚有蹼，不仅能在陆地上奔跑，还能游泳过河。', color: '#A8A878' },
  { id: 21, name: '烈雀', nameEn: 'Spearow', nameJp: 'オニスズメ', genus: '小鸟宝可梦', types: ['一般', '飞行'], height: 0.3, weight: 2.0, desc: '叫声非常响亮，性格暴躁，喜欢成群结队发起攻击。', color: '#A8A878' },
  { id: 22, name: '大嘴雀', nameEn: 'Fearow', nameJp: 'オニドリル', genus: '喙宝可梦', types: ['一般', '飞行'], height: 1.2, weight: 38.0, desc: '拥有巨大的翅膀和长长的尖喙，能在空中持续飞行一整天。', color: '#A8A878' },
  { id: 23, name: '阿柏蛇', nameEn: 'Ekans', nameJp: 'アーボ', genus: '蛇宝可梦', types: ['毒'], height: 2.0, weight: 6.9, desc: '静静潜伏在草丛中，能够把下巴脱臼吞下比自己脑袋大很多的东西。', color: '#A040A0' },
  { id: 24, name: '阿柏怪', nameEn: 'Arbok', nameJp: 'アーボック', genus: '眼镜蛇宝可梦', types: ['毒'], height: 3.5, weight: 65.0, desc: '肚子上的花纹像一张可怕的人脸，能吓退凶猛的捕食者。', color: '#A040A0' },
  { id: 25, name: '皮卡丘', nameEn: 'Pikachu', nameJp: 'ピカチュウ', genus: '鼠宝可梦', types: ['电'], height: 0.4, weight: 6.0, desc: '两颊长有储存电力的电气袋，遇到危险时会放电反击，十分可爱而勇敢。', color: '#F8D030', cryName: '皮卡皮卡！' },
  { id: 26, name: '雷丘', nameEn: 'Raichu', nameJp: 'ライチュウ', genus: '鼠宝可梦', types: ['电'], height: 0.8, weight: 30.0, desc: '电袋充满电力时，耳朵会竖立起来，长长的闪电尾巴可以引导电流。', color: '#F8D030' },
  { id: 27, name: '穿山鼠', nameEn: 'Sandshrew', nameJp: 'サンド', genus: '鼠宝可梦', types: ['地面'], height: 0.6, weight: 12.0, desc: '喜欢生活在干燥的沙漠里，受到惊吓会卷成一个坚硬的小球。', color: '#E0C068' },
  { id: 28, name: '穿山王', nameEn: 'Sandslash', nameJp: 'サンドパン', genus: '鼠宝可梦', types: ['地面'], height: 1.0, weight: 29.5, desc: '背部长满锋利的硬刺，卷曲身体突进时威力惊人。', color: '#E0C068' },
  { id: 29, name: '尼多兰', nameEn: 'Nidoran♀', nameJp: 'ニドラン♀', genus: '毒针宝可梦', types: ['毒'], height: 0.4, weight: 7.0, desc: '身上的刺很小但带有剧毒，嗅觉非常灵敏。', color: '#A040A0' },
  { id: 30, name: '尼多娜', nameEn: 'Nidorina', nameJp: 'ニドリーナ', genus: '毒针宝可梦', types: ['毒'], height: 0.8, weight: 20.0, desc: '性情温顺，但是遇到危险也会坚决用头部的角保护伙伴。', color: '#A040A0' },
  { id: 31, name: '尼多后', nameEn: 'Nidoqueen', nameJp: 'ニドクイン', genus: '钻锥宝可梦', types: ['毒', '地面'], height: 1.3, weight: 60.0, desc: '坚硬如铁的鳞片包裹全身，全力撞击时甚至能撞飞卡车。', color: '#A040A0' },
  { id: 32, name: '尼多朗', nameEn: 'Nidoran♂', nameJp: 'ニドラン♂', genus: '毒针宝可梦', types: ['毒'], height: 0.5, weight: 9.0, desc: '大耳朵能够自由转动，警惕周围任何细微的声音。', color: '#A040A0' },
  { id: 33, name: '尼多力诺', nameEn: 'Nidorino', nameJp: 'ニドリーノ', genus: '毒针宝可梦', types: ['毒'], height: 0.9, weight: 19.5, desc: '头部的角比钻石还要坚硬，一旦被刺中就会注入毒液。', color: '#A040A0' },
  { id: 34, name: '尼多王', nameEn: 'Nidoking', nameJp: 'ニドキング', genus: '钻锥宝可梦', types: ['毒', '地面'], height: 1.4, weight: 62.0, desc: '粗壮的尾巴一扫就能粉碎大岩石，气势威武的宝可梦。', color: '#A040A0' },
  { id: 35, name: '皮皮', nameEn: 'Clefairy', nameJp: 'ピッピ', genus: '妖精宝可梦', types: ['妖精'], height: 0.6, weight: 7.5, desc: '因为可爱的外表和翅膀，在满月之夜会聚在一起快乐跳舞。', color: '#EE99AC' },
  { id: 36, name: '皮可西', nameEn: 'Clefable', nameJp: 'ピクシー', genus: '妖精宝可梦', types: ['妖精'], height: 1.3, weight: 40.0, desc: '能够听到一公里外的绣花针落地的声音，动作轻盈犹如漂浮。', color: '#EE99AC' },
  { id: 37, name: '六尾', nameEn: 'Vulpix', nameJp: 'ロコン', genus: '狐狸宝可梦', types: ['火'], height: 0.6, weight: 9.9, desc: '出生时只有一条尾巴，随着长大慢慢分叉成六条漂亮的红尾巴。', color: '#F08030', cryName: '呜呜~' },
  { id: 38, name: '九尾', nameEn: 'Ninetales', nameJp: 'キュウコン', genus: '狐狸宝可梦', types: ['火'], height: 1.1, weight: 19.9, desc: '九条尾巴蕴含着神奇的神圣力量，据说能活一千年之久。', color: '#F08030' },
  { id: 39, name: '胖丁', nameEn: 'Jigglypuff', nameJp: 'プリン', genus: '气球宝可梦', types: ['一般', '妖精'], height: 0.5, weight: 5.5, desc: '晃动大眼睛唱出优美动听的催眠曲，让听到的人瞬间入睡。', color: '#EE99AC', cryName: '波波咯波波利~' },
  { id: 40, name: '胖可丁', nameEn: 'Wigglytuff', nameJp: 'プクリン', genus: '气球宝可梦', types: ['一般', '妖精'], height: 1.0, weight: 12.0, desc: '身体弹性极佳，吸气后能无限膨胀，毛皮摸起来极其柔软舒适。', color: '#EE99AC' },
  { id: 41, name: '超音蝠', nameEn: 'Zubat', nameJp: 'ズバット', genus: '蝙蝠宝可梦', types: ['毒', '飞行'], height: 0.8, weight: 7.5, desc: '虽然没有眼睛，但通过嘴里发射的超声波能精准感知周围障碍物。', color: '#A040A0' },
  { id: 42, name: '大嘴蝠', nameEn: 'Golbat', nameJp: 'ゴルバット', genus: '蝙蝠宝可梦', types: ['毒', '飞行'], height: 1.6, weight: 55.0, desc: '长着尖锐的牙齿，能在黑暗洞穴中静悄悄飞向敌人。', color: '#A040A0' },
  { id: 43, name: '走路草', nameEn: 'Oddish', nameJp: 'ナゾノクサ', genus: '杂草宝可梦', types: ['草', '毒'], height: 0.5, weight: 5.4, desc: '白天把身体埋在土里睡觉，夜晚借着月光出来漫步播撒种子。', color: '#78C850' },
  { id: 44, name: '臭臭花', nameEn: 'Gloom', nameJp: 'クサイハナ', genus: '杂草宝可梦', types: ['草', '毒'], height: 0.8, weight: 8.6, desc: '闻起来极臭的花蜜对它自己却是难得的美味，越危险闻起来越臭。', color: '#78C850' },
  { id: 45, name: '霸王花', nameEn: 'Vileplume', nameJp: 'ラフレシア', genus: '花宝可梦', types: ['草', '毒'], height: 1.2, weight: 18.6, desc: '拥有世界上最大的花瓣，每走一步都会扬起大量过敏花粉。', color: '#78C850' },
  { id: 50, name: '地鼠', nameEn: 'Diglett', nameJp: 'ディグダ', genus: '鼹鼠宝可梦', types: ['地面'], height: 0.2, weight: 0.8, desc: '生活在地下浅层，在地底下啃食树根，偶尔探出头来透气。', color: '#E0C068', cryName: '地鼠地鼠！' },
  { id: 51, name: '三地鼠', nameEn: 'Dugtrio', nameJp: 'ダグトリオ', genus: '鼹鼠宝可梦', types: ['地面'], height: 0.7, weight: 33.3, desc: '三只地鼠齐心合力，能以惊人速度在地底挖掘深邃隧道。', color: '#E0C068' },
  { id: 52, name: '喵喵', nameEn: 'Meowth', nameJp: 'ニャース', genus: '妖怪猫宝可梦', types: ['一般'], height: 0.4, weight: 4.2, desc: '喜欢圆圆发光的东西，额头上的金币非常惹人喜爱。', color: '#A8A878', cryName: '喵~就是这样！' },
  { id: 53, name: '猫老大', nameEn: 'Persian', nameJp: 'ペルシアン', genus: '优雅宝可梦', types: ['一般'], height: 1.0, weight: 32.0, desc: '步态优雅敏捷，额头嵌着红宝石，性格傲慢却极富力量。', color: '#A8A878' },
  { id: 54, name: '可达鸭', nameEn: 'Psyduck', nameJp: 'コダック', genus: '鸭宝可梦', types: ['水'], height: 0.8, weight: 19.6, desc: '总是一副头痛抱头的呆呆表情，当头痛剧烈时会爆发出强大的念力！', color: '#6890F0', cryName: '可达可达~？' },
  { id: 55, name: '哥达鸭', nameEn: 'Golduck', nameJp: 'ゴルダック', genus: '鸭宝可梦', types: ['水'], height: 1.7, weight: 76.6, desc: '游泳健将，额头红宝石闪耀时能使出强劲的超能力。', color: '#6890F0' },
  { id: 58, name: '卡蒂狗', nameEn: 'Growlithe', nameJp: 'ガーディ', genus: '小狗宝可梦', types: ['火'], height: 0.7, weight: 19.0, desc: '对主人极为忠诚，嗅觉比人类灵敏一万倍，勇敢又可靠。', color: '#F08030', cryName: '汪汪！' },
  { id: 59, name: '风速狗', nameEn: 'Arcanine', nameJp: 'ウインディ', genus: '传说宝可梦', types: ['火'], height: 1.9, weight: 155.0, desc: '中国古代传说中威风凛凛的神兽，能在一天之内奔跑一万公里。', color: '#F08030' },
  { id: 60, name: '蚊香蝌蚪', nameEn: 'Poliwag', nameJp: 'ニョロモ', genus: '蝌蚪宝可梦', types: ['水'], height: 0.6, weight: 12.4, desc: '肚皮上的螺旋花纹清晰可见，在水里甩动尾巴灵活游泳。', color: '#6890F0' },
  { id: 63, name: '凯西', nameEn: 'Abra', nameJp: 'ケーシィ', genus: '念力宝可梦', types: ['超能力'], height: 0.9, weight: 19.5, desc: '每天要睡十八个小时，即使在睡觉时也能感应危机并瞬间移动。', color: '#F85888' },
  { id: 65, name: '胡地', nameEn: 'Alakazam', nameJp: 'フーディン', genus: '念力宝可梦', types: ['超能力'], height: 1.5, weight: 48.0, desc: '智商高达五千，大脑细胞无限分裂，手中汤匙弯曲自如。', color: '#F85888' },
  { id: 66, name: '腕力', nameEn: 'Machop', nameJp: 'ワンリキー', genus: '怪力宝可梦', types: ['格斗'], height: 0.8, weight: 19.5, desc: '全身都是精壮的肌肉，哪怕还是小孩子也能轻松举起一百个成年人。', color: '#C03028' },
  { id: 68, name: '怪力', nameEn: 'Machamp', nameJp: 'カイリキー', genus: '怪力宝可梦', types: ['格斗'], height: 1.6, weight: 130.0, desc: '四只强壮手臂两秒能打出一千拳，移动山峦不在话下。', color: '#C03028' },
  { id: 74, name: '小拳石', nameEn: 'Geodude', nameJp: 'イシツブテ', genus: '岩石宝可梦', types: ['岩石', '地面'], height: 0.4, weight: 20.0, desc: '趴在山路上像普通的石头，踩上去它就会生气挥拳。', color: '#B8A038' },
  { id: 77, name: '小火马', nameEn: 'Ponyta', nameJp: 'ポニータ', genus: '火马宝可梦', types: ['火'], height: 1.0, weight: 30.0, desc: '刚出生时鬃毛还是温热的，在奔跑锻炼中鬃毛变成熊熊烈火。', color: '#F08030' },
  { id: 78, name: '烈焰马', nameEn: 'Rapidash', nameJp: 'ギャロップ', genus: '火马宝可梦', types: ['火'], height: 1.7, weight: 95.0, desc: '时速高达二百四十公里，奔跑时如同红色流星划过天际。', color: '#F08030' },
  { id: 79, name: '呆呆兽', nameEn: 'Slowpoke', nameJp: 'ヤドン', genus: '憨憨宝可梦', types: ['水', '超能力'], height: 1.2, weight: 36.0, desc: '动作总是慢吞吞的，尾巴被咬了要到第二天才会觉得痛。', color: '#6890F0', cryName: '呀——咚？' },
  { id: 80, name: '呆壳兽', nameEn: 'Slowbro', nameJp: 'ヤドラン', genus: '寄居蟹宝可梦', types: ['水', '超能力'], height: 1.6, weight: 78.5, desc: '尾巴被大舌贝咬住后启发了智慧，两只宝可梦共生在一起。', color: '#6890F0' },
  { id: 81, name: '小磁怪', nameEn: 'Magnemite', nameJp: 'コイル', genus: '磁铁宝可梦', types: ['电', '钢'], height: 0.3, weight: 6.0, desc: '左右两侧的磁铁释放电磁力，使自己一直漂浮在空中。', color: '#F8D030' },
  { id: 92, name: '鬼斯', nameEn: 'Gastly', nameJp: 'ゴース', genus: '气体宝可梦', types: ['幽灵', '毒'], height: 1.3, weight: 0.1, desc: '身体百分之九十五都是气体，能轻易穿透任何墙壁和缝隙。', color: '#705898' },
  { id: 93, name: '鬼斯通', nameEn: 'Haunter', nameJp: 'ゴースト', genus: '气体宝可梦', types: ['幽灵', '毒'], height: 1.6, weight: 0.1, desc: '喜欢潜伏在黑暗阴影里，伸出长舌头舔一下会让人冷得发抖。', color: '#705898' },
  { id: 94, name: '耿鬼', nameEn: 'Gengar', nameJp: 'ゲンガー', genus: '影子宝可梦', types: ['幽灵', '毒'], height: 1.5, weight: 40.5, desc: '满月之夜潜入人的影子中偷笑。室温突然下降就是它靠近的迹象！', color: '#705898', cryName: '桀桀桀！' },
  { id: 95, name: '大岩蛇', nameEn: 'Onix', nameJp: 'イワーク', genus: '岩蛇宝可梦', types: ['岩石', '地面'], height: 8.8, weight: 210.0, desc: '身躯由坚硬的巨石串连而成，在地下穿梭时会发出打雷般的轰鸣。', color: '#B8A038' },
  { id: 104, name: '卡拉卡拉', nameEn: 'Cubone', nameJp: 'カラカラ', genus: '孤独宝可梦', types: ['地面'], height: 0.4, weight: 6.5, desc: '头上戴着思念母亲的头盖骨，寂寞时会发出令人心疼的哭泣声。', color: '#E0C068' },
  { id: 105, name: '嘎啦嘎啦', nameEn: 'Marowak', nameJp: 'ガラガラ', genus: '骨头宝可梦', types: ['地面'], height: 1.0, weight: 45.0, desc: '战胜了悲伤变得坚强勇敢，将骨头当成回旋镖熟练战斗。', color: '#E0C068' },
  { id: 129, name: '鲤鱼王', nameEn: 'Magikarp', nameJp: 'コイキング', genus: '鱼宝可梦', types: ['水'], height: 0.9, weight: 10.0, desc: '力量微弱只会在水边扑腾蹦跳，但蕴含着无限进化的潜能！', color: '#6890F0', cryName: '扑腾扑腾！' },
  { id: 130, name: '暴鲤龙', nameEn: 'Gyarados', nameJp: 'ギャラドス', genus: '凶恶宝可梦', types: ['水', '飞行'], height: 6.5, weight: 235.0, desc: '从弱小的鲤鱼王进化而来的狂暴巨龙，口吐烈焰与暴风破坏一切。', color: '#6890F0', cryName: '吼昂——！' },
  { id: 131, name: '拉普拉斯', nameEn: 'Lapras', nameJp: 'ラプラス', genus: '乘载宝可梦', types: ['水', '冰'], height: 2.5, weight: 220.0, desc: '心底非常善良，能听懂人类的语言，喜欢背着人在大海上航行。', color: '#6890F0' },
  { id: 132, name: '百变怪', nameEn: 'Ditto', nameJp: 'メタモン', genus: '变身宝可梦', types: ['一般'], height: 0.3, weight: 4.0, desc: '身体如软泥般柔软，可以重组细胞变身成看到的任何宝可梦！', color: '#A8A878', cryName: '变身！' },
  { id: 133, name: '伊布', nameEn: 'Eevee', nameJp: 'イーブイ', genus: '进化宝可梦', types: ['一般'], height: 0.3, weight: 6.5, desc: '拥有不稳定的基因结构，能根据环境进化成水、雷、火等多种形态！超受喜爱！', color: '#C6A168', cryName: '布咿布咿！' },
  { id: 134, name: '水伊布', nameEn: 'Vaporeon', nameJp: 'シャワーズ', genus: '吐泡宝可梦', types: ['水'], height: 1.0, weight: 29.0, desc: '细胞结构与水分子相似，融入水中便无影无踪。', color: '#6890F0' },
  { id: 135, name: '雷伊布', nameEn: 'Jolteon', nameJp: 'サンダース', genus: '雷宝可梦', types: ['电'], height: 0.8, weight: 24.5, desc: '毛发像针一样竖立，能够释放一万伏特的高压电击。', color: '#F8D030' },
  { id: 136, name: '火伊布', nameEn: 'Flareon', nameJp: 'ブースター', genus: '火宝可梦', types: ['火'], height: 0.9, weight: 25.0, desc: '体内有火焰囊，体温最高可达九百度，吐出熊熊火焰。', color: '#F08030' },
  { id: 143, name: '卡比兽', nameEn: 'Snorlax', nameJp: 'カビゴン', genus: '瞌睡宝可梦', types: ['一般'], height: 2.1, weight: 460.0, desc: '吃饱了就呼呼大睡，胃极其强大，连变质发霉的食物都能消化。', color: '#0B4F6C', cryName: '呼噜噜——' },
  { id: 144, name: '急冻鸟', nameEn: 'Articuno', nameJp: 'フリーザー', genus: '冷冻宝可梦', types: ['冰', '飞行'], height: 1.7, weight: 55.4, desc: '传说中的三圣鸟之一，振翅能让空气中的水汽瞬间凝结成漫天飞雪。', color: '#98D8D8' },
  { id: 145, name: '闪电鸟', nameEn: 'Zapdos', nameJp: 'サンダー', genus: '电击宝可梦', types: ['电', '飞行'], height: 1.6, weight: 52.6, desc: '传说中的三圣鸟之一，在黑云雷电中穿梭飞翔，挥翅引发雷暴。', color: '#F8D030' },
  { id: 146, name: '火焰鸟', nameEn: 'Moltres', nameJp: 'ファイヤー', genus: '火焰宝可梦', types: ['火', '飞行'], height: 2.0, weight: 60.0, desc: '传说中的三圣鸟之一，在火山口浴火重生，羽翼宛如燃烧的晚霞。', color: '#F08030' },
  { id: 147, name: '迷你龙', nameEn: 'Dratini', nameJp: 'ミニリュウ', genus: '龙宝可梦', types: ['龙'], height: 1.8, weight: 3.3, desc: '被清澈湖水守护的幻之龙宝可梦，不断蜕皮长出更强大的力量。', color: '#7038F8' },
  { id: 148, name: '哈克龙', nameEn: 'Dragonair', nameJp: 'ハクリュー', genus: '龙宝可梦', types: ['龙'], height: 4.0, weight: 16.5, desc: '身上散发着神圣的光芒，能够自由操纵天气呼风唤雨。', color: '#7038F8' },
  { id: 149, name: '快龙', nameEn: 'Dragonite', nameJp: 'カイリュー', genus: '龙宝可梦', types: ['龙', '飞行'], height: 2.2, weight: 210.0, desc: '心地极其善良的飞龙，十六小时就能环绕地球飞行一圈！', color: '#E09030', cryName: '呜嗷——！' },
  { id: 150, name: '超梦', nameEn: 'Mewtwo', nameJp: 'ミュウツー', genus: '基因宝可梦', types: ['超能力'], height: 2.0, weight: 122.0, desc: '利用梦幻基因人工创造出的终极宝可梦，拥有压倒性的超能力战斗力！', color: '#9B59B6', cryName: '吾乃超梦！' },
  { id: 151, name: '梦幻', nameEn: 'Mew', nameJp: 'ミュウ', genus: '新种宝可梦', types: ['超能力'], height: 0.4, weight: 4.0, desc: '据说拥有所有宝可梦的基因，只有心灵纯洁的孩子才能一睹它的真容！', color: '#FFB6C1', cryName: '喵呜~' },
];

// Fill the rest of the 151 with standard names
const all151Names = [
  '妙蛙种子','妙蛙草','妙蛙花','小火龙','火恐龙','喷火龙','杰尼龟','卡咪龟','水箭龟','绿毛虫','铁甲蛹','巴大蝶',
  '独角虫','铁壳蛹','大针蜂','波波','比比鸟','大比鸟','小拉达','拉达','烈雀','大嘴雀','阿柏蛇','阿柏怪',
  '皮卡丘','雷丘','穿山鼠','穿山王','尼多兰','尼多娜','尼多后','尼多朗','尼多力诺','尼多王','皮皮','皮可西',
  '六尾','九尾','胖丁','胖可丁','超音蝠','大嘴蝠','走路草','臭臭花','霸王花','派拉斯','派拉斯特','毛球','摩鲁蛾',
  '地鼠','三地鼠','喵喵','猫老大','可达鸭','哥达鸭','猴怪','火暴猴','卡蒂狗','风速狗','蚊香蝌蚪','蚊香君','蚊香泳士',
  '凯西','勇基拉','胡地','腕力','豪力','怪力','喇叭芽','口呆花','大食花','玛瑙水母','毒刺水母','小拳石','隆隆石','隆隆岩',
  '小火马','烈焰马','呆呆兽','呆壳兽','小磁怪','三合一磁怪','大葱鸭','嘟嘟','嘟嘟利','小海狮','白海狮','臭泥','臭臭泥',
  '大舌贝','刺甲贝','鬼斯','鬼斯通','耿鬼','大岩蛇','催眠貘','引梦貘人','大钳蟹','巨钳蟹','霹雳电球','顽皮雷弹',
  '蛋蛋','椰蛋树','卡拉卡拉','嘎啦嘎啦','飞腿郎','快拳郎','大舌头','瓦斯弹','双弹瓦斯','独角犀牛','钻角犀兽','吉利蛋',
  '蔓藤怪','袋兽','墨海马','海刺龙','角金鱼','金鱼王','海星星','宝石海星','魔墙人偶','飞天螳螂','迷唇姐','电击兽','鸭嘴火兽',
  '凯罗斯','肯泰罗','鲤鱼王','暴鲤龙','拉普拉斯','百变怪','伊布','水伊布','雷伊布','火伊布','多边兽','菊石兽','多刺菊石兽',
  '化石盔','镰刀盔','化石翼龙','卡比兽','急冻鸟','闪电鸟','火焰鸟','迷你龙','哈克龙','快龙','超梦','梦幻'
];

const mappedMap = new Map();
kantoData.forEach(p => mappedMap.set(p.id, p));

const fullList = [];
for (let id = 1; id <= 151; id++) {
  if (mappedMap.has(id)) {
    const item = mappedMap.get(id);
    fullList.push({
      id: item.id,
      name: item.name,
      nameEn: item.nameEn,
      nameJp: item.nameJp,
      genus: item.genus,
      types: item.types,
      height: item.height,
      weight: item.weight,
      description: item.desc,
      artworkUrl: 'https://fastly.jsdelivr.net/gh/PokeAPI/sprites@master/sprites/pokemon/other/official-artwork/' + id + '.png',
      cryUrl: 'https://fastly.jsdelivr.net/gh/PokeAPI/cries@main/cries/pokemon/latest/' + id + '.ogg',
      color: item.color,
      catchphrase: item.cryName || (item.name + '！')
    });
  } else {
    const name = all151Names[id - 1] || ('宝可梦' + id);
    fullList.push({
      id: id,
      name: name,
      nameEn: 'Pokemon #' + id,
      nameJp: 'ポケモン',
      genus: '宝可梦',
      types: ['一般'],
      height: 1.0,
      weight: 20.0,
      description: '关都地区编号第' + id + '号宝可梦，充满未知的强大生物。',
      artworkUrl: 'https://fastly.jsdelivr.net/gh/PokeAPI/sprites@master/sprites/pokemon/other/official-artwork/' + id + '.png',
      cryUrl: 'https://fastly.jsdelivr.net/gh/PokeAPI/cries@main/cries/pokemon/latest/' + id + '.ogg',
      color: '#DC0A2D',
      catchphrase: name + '！'
    });
  }
}

const fileContent = `import type { Pokemon } from '../types/pokemon';

export const POKEMON_LIST: Pokemon[] = ` + JSON.stringify(fullList, null, 2) + `;

export const POPULAR_TOY_POKEMON_IDS = [25, 4, 7, 1, 133, 94, 143, 39, 54, 150, 6, 9, 3, 149, 151, 52];

export const getPokemonById = (id: number): Pokemon => {
  return POKEMON_LIST.find(p => p.id === id) || POKEMON_LIST[24]; // default Pikachu
};

export const getPopularToys = (): Pokemon[] => {
  return POPULAR_TOY_POKEMON_IDS.map(id => getPokemonById(id));
};
`;

fs.writeFileSync('src/data/pokemonList.ts', fileContent, 'utf-8');
console.log('Successfully generated src/data/pokemonList.ts with 151 Pokemon!');
