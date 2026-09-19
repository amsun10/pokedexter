/**
 * Comprehensive Benchmark Suite for Pokemon Detector
 * Tests accuracy, recall, and false positive rejection across all 151 Gen 1 Pokemon color families.
 */

import { detectPokemonByLocalHeuristics, analyzeCanvasColors } from '../src/services/detector.ts';
import { POKEMON_LIST, getPokemonById } from '../src/data/pokemonList.ts';

// Lightweight pure-JS Mock Canvas for Node.js
class MockCanvas {
  width: number;
  height: number;
  private buffer: Uint8ClampedArray;

  constructor(width = 300, height = 300) {
    this.width = width;
    this.height = height;
    this.buffer = new Uint8ClampedArray(width * height * 4);
  }

  getContext(type: string) {
    if (type !== '2d') return null;
    return {
      getImageData: (sx: number, sy: number, sw: number, sh: number) => {
        const out = new Uint8ClampedArray(sw * sh * 4);
        for (let y = 0; y < sh; y++) {
          const srcY = sy + y;
          if (srcY < 0 || srcY >= this.height) continue;
          for (let x = 0; x < sw; x++) {
            const srcX = sx + x;
            if (srcX < 0 || srcX >= this.width) continue;
            const srcIdx = (srcY * this.width + srcX) * 4;
            const dstIdx = (y * sw + x) * 4;
            out[dstIdx] = this.buffer[srcIdx];
            out[dstIdx + 1] = this.buffer[srcIdx + 1];
            out[dstIdx + 2] = this.buffer[srcIdx + 2];
            out[dstIdx + 3] = this.buffer[srcIdx + 3];
          }
        }
        return { data: out, width: sw, height: sh };
      }
    };
  }

  fill(r: number, g: number, b: number, a = 255) {
    for (let i = 0; i < this.buffer.length; i += 4) {
      this.buffer[i] = r;
      this.buffer[i + 1] = g;
      this.buffer[i + 2] = b;
      this.buffer[i + 3] = a;
    }
  }

  fillCircle(cx: number, cy: number, radius: number, r: number, g: number, b: number) {
    const r2 = radius * radius;
    const minX = Math.max(0, Math.floor(cx - radius));
    const maxX = Math.min(this.width - 1, Math.ceil(cx + radius));
    const minY = Math.max(0, Math.floor(cy - radius));
    const maxY = Math.min(this.height - 1, Math.ceil(cy + radius));

    for (let y = minY; y <= maxY; y++) {
      for (let x = minX; x <= maxX; x++) {
        const dx = x - cx;
        const dy = y - cy;
        if (dx * dx + dy * dy <= r2) {
          const idx = (y * this.width + x) * 4;
          this.buffer[idx] = r;
          this.buffer[idx + 1] = g;
          this.buffer[idx + 2] = b;
          this.buffer[idx + 3] = 255;
        }
      }
    }
  }

  addNoise(amount: number) {
    for (let i = 0; i < this.buffer.length; i += 4) {
      const n = (Math.random() - 0.5) * amount * 2;
      this.buffer[i] = Math.min(255, Math.max(0, this.buffer[i] + n));
      this.buffer[i + 1] = Math.min(255, Math.max(0, this.buffer[i + 1] + n));
      this.buffer[i + 2] = Math.min(255, Math.max(0, this.buffer[i + 2] + n));
    }
  }
}

// Interface for test cases
interface BenchmarkTestCase {
  id: string;
  name: string;
  category: 'POSITIVE' | 'NEGATIVE' | 'DISAMBIGUATION';
  description: string;
  generateCanvas: () => MockCanvas;
  expectedPokemonId?: number;
  acceptableIds?: number[];
  shouldMatch: boolean;
}

const testCases: BenchmarkTestCase[] = [
  // ==========================================
  // A. 正向全色谱宝可梦测试 (True Positives)
  // ==========================================
  {
    id: 'TP-ELEC-01',
    name: '皮卡丘 (标准自然日光)',
    category: 'POSITIVE',
    description: '明亮日光下的皮卡丘玩偶：明黄色主体 + 红色脸颊 + 黑色耳尖',
    expectedPokemonId: 25,
    shouldMatch: true,
    generateCanvas: () => {
      const c = new MockCanvas(300, 300);
      c.fill(220, 220, 220); // 浅灰背景
      c.fillCircle(150, 150, 95, 255, 222, 0); // 皮卡丘经典明黄 (RGB: 255, 222, 0)
      c.fillCircle(115, 160, 15, 225, 30, 30); // 红色脸颊斑
      c.fillCircle(185, 160, 15, 225, 30, 30); // 红色脸颊斑
      c.fillCircle(105, 80, 14, 20, 20, 20);   // 黑色耳尖
      c.fillCircle(195, 80, 14, 20, 20, 20);   // 黑色耳尖
      c.addNoise(10);
      return c;
    }
  },
  {
    id: 'TP-ELEC-02',
    name: '皮卡丘 (2700K 室内暖光灯)',
    category: 'POSITIVE',
    description: '暖光下的皮卡丘：色温偏黄偏橙，但由于G/R保持高位，绝不能误判为伊布',
    expectedPokemonId: 25,
    shouldMatch: true,
    generateCanvas: () => {
      const c = new MockCanvas(300, 300);
      c.fill(180, 170, 160); // 室内暖灰背景
      c.fillCircle(150, 150, 95, 248, 195, 28); // 暖光色温偏移黄
      c.fillCircle(115, 160, 15, 220, 35, 25);  // 脸颊红斑
      c.fillCircle(185, 160, 15, 220, 35, 25);
      c.fillCircle(105, 80, 14, 35, 25, 20);    // 耳尖暗斑
      c.addNoise(12);
      return c;
    }
  },
  {
    id: 'TP-ELEC-03',
    name: '皮卡丘 (木纹桌面背景干扰)',
    category: 'POSITIVE',
    description: '皮卡丘玩偶放置在深色木桌上（背景包含大量红棕色木纹），必须精准识别皮卡丘',
    expectedPokemonId: 25,
    shouldMatch: true,
    generateCanvas: () => {
      const c = new MockCanvas(300, 300);
      c.fill(130, 80, 45); // 深棕色木桌背景
      c.fillCircle(150, 150, 90, 250, 215, 15); // 皮卡丘亮黄主体
      c.fillCircle(120, 155, 15, 220, 30, 30);  // 红脸颊
      c.fillCircle(180, 155, 15, 220, 30, 30);
      c.addNoise(10);
      return c;
    }
  },
  {
    id: 'TP-ELEC-04',
    name: '可达鸭 (呆萌纯黄 + 浅白黄喙)',
    category: 'POSITIVE',
    description: '可达鸭：全身土黄/纯黄色 (#FED000) + 浅黄色鸭喙',
    expectedPokemonId: 54,
    acceptableIds: [25, 54], // 黄色家族候选
    shouldMatch: true,
    generateCanvas: () => {
      const c = new MockCanvas(300, 300);
      c.fill(230, 230, 235);
      c.fillCircle(150, 150, 95, 248, 208, 64); // 可达鸭纯黄
      c.fillCircle(150, 175, 30, 245, 230, 150); // 浅色扁喙
      c.fillCircle(150, 65, 8, 25, 25, 25);      // 标志性呆头顶黑发
      c.fillCircle(125, 140, 6, 25, 25, 25);     // 呆萌黑眼珠
      c.fillCircle(175, 140, 6, 25, 25, 25);
      c.addNoise(8);
      return c;
    }
  },
  {
    id: 'TP-FIRE-01',
    name: '小火龙 (橙红主体 + 浅黄腹部)',
    category: 'POSITIVE',
    description: '小火龙玩偶：橙红色身体 (#F08030) + 浅奶油色肚皮',
    expectedPokemonId: 4,
    shouldMatch: true,
    generateCanvas: () => {
      const c = new MockCanvas(300, 300);
      c.fill(210, 215, 220);
      c.fillCircle(150, 150, 90, 240, 110, 35); // 亮橙色
      c.fillCircle(150, 170, 35, 245, 225, 160); // 奶油黄色肚皮
      c.addNoise(10);
      return c;
    }
  },
  {
    id: 'TP-FIRE-02',
    name: '喷火龙 (深橙 + 青蓝内翅)',
    category: 'POSITIVE',
    description: '喷火龙：深橙色身躯 + 翅膀内侧青蓝色',
    expectedPokemonId: 6,
    acceptableIds: [4, 6],
    shouldMatch: true,
    generateCanvas: () => {
      const c = new MockCanvas(300, 300);
      c.fill(200, 200, 200);
      c.fillCircle(150, 150, 85, 235, 100, 25); // 深橙红
      c.fillCircle(85, 120, 25, 45, 140, 150);  // 青蓝翼膜
      c.fillCircle(215, 120, 25, 45, 140, 150);
      c.addNoise(10);
      return c;
    }
  },
  {
    id: 'TP-FIRE-03',
    name: '火伊布 (鲜红 + 奶油黄毛发)',
    category: 'POSITIVE',
    description: '火伊布：鲜红身体 + 蓬松奶油黄颈部与头顶毛',
    expectedPokemonId: 136,
    acceptableIds: [4, 136],
    shouldMatch: true,
    generateCanvas: () => {
      const c = new MockCanvas(300, 300);
      c.fill(220, 220, 225);
      c.fillCircle(150, 150, 85, 225, 75, 40);  // 鲜红橙
      c.fillCircle(150, 170, 40, 245, 220, 130); // 奶油黄颈毛
      c.addNoise(10);
      return c;
    }
  },
  {
    id: 'TP-WATER-01',
    name: '杰尼龟 (水蓝 + 棕色背壳 + 浅黄腹)',
    category: 'POSITIVE',
    description: '杰尼龟：水蓝色身体 (#6890F0) + 棕色龟壳 + 浅黄腹甲',
    expectedPokemonId: 7,
    shouldMatch: true,
    generateCanvas: () => {
      const c = new MockCanvas(300, 300);
      c.fill(235, 235, 230);
      c.fillCircle(150, 150, 90, 80, 175, 230);  // 浅水蓝
      c.fillCircle(150, 160, 45, 235, 220, 150); // 浅淡腹甲
      c.fillCircle(150, 130, 30, 140, 75, 35);   // 棕色边缘壳
      c.addNoise(10);
      return c;
    }
  },
  {
    id: 'TP-WATER-02',
    name: '蚊香君 (深蓝 + 纯白螺旋腹)',
    category: 'POSITIVE',
    description: '蚊香君：深邃群青蓝身体 + 白色腹部',
    expectedPokemonId: 61,
    acceptableIds: [7, 60, 61, 62],
    shouldMatch: true,
    generateCanvas: () => {
      const c = new MockCanvas(300, 300);
      c.fill(210, 210, 210);
      c.fillCircle(150, 150, 90, 35, 80, 185);  // 深群青蓝
      c.fillCircle(150, 155, 45, 245, 245, 245); // 白肚皮
      c.addNoise(10);
      return c;
    }
  },
  {
    id: 'TP-WATER-03',
    name: '拉普拉斯 (海天蓝 + 灰背壳)',
    category: 'POSITIVE',
    description: '拉普拉斯：经典蓝青色身体 + 灰色甲壳',
    expectedPokemonId: 131,
    acceptableIds: [7, 131],
    shouldMatch: true,
    generateCanvas: () => {
      const c = new MockCanvas(300, 300);
      c.fill(230, 230, 230);
      c.fillCircle(150, 150, 90, 60, 150, 210); // 海天蓝
      c.fillCircle(150, 160, 40, 120, 125, 135); // 灰壳
      c.addNoise(10);
      return c;
    }
  },
  {
    id: 'TP-GRASS-01',
    name: '妙蛙种子 (蓝绿/青绿 + 粉红花苞)',
    category: 'POSITIVE',
    description: '妙蛙种子：青蓝绿身体 (#78C850/青绿) + 背上深粉红花苞',
    expectedPokemonId: 1,
    shouldMatch: true,
    generateCanvas: () => {
      const c = new MockCanvas(300, 300);
      c.fill(225, 225, 225);
      c.fillCircle(150, 150, 90, 60, 180, 155); // 蓝绿色身体 (Teal-Cyan)
      c.fillCircle(150, 100, 35, 215, 65, 95);  // 背上粉红花苞
      c.fillCircle(120, 140, 18, 35, 120, 95);  // 墨绿斑块
      c.addNoise(10);
      return c;
    }
  },
  {
    id: 'TP-GRASS-02',
    name: '绿毛虫 (鲜绿 + 黄腹 + 红色触角)',
    category: 'POSITIVE',
    description: '绿毛虫：青苹果鲜绿 + 黄色腹节 + 红色 Y 型触角',
    expectedPokemonId: 10,
    acceptableIds: [1, 10],
    shouldMatch: true,
    generateCanvas: () => {
      const c = new MockCanvas(300, 300);
      c.fill(220, 220, 220);
      c.fillCircle(150, 150, 85, 75, 185, 45);   // 鲜翠绿
      c.fillCircle(150, 170, 35, 235, 220, 80);  // 浅黄腹
      c.fillCircle(150, 90, 15, 225, 35, 35);    // 红色触角
      c.addNoise(10);
      return c;
    }
  },
  {
    id: 'TP-GHOST-01',
    name: '耿鬼 (暗紫浓烈 + 鲜红眼睛)',
    category: 'POSITIVE',
    description: '耿鬼玩偶：深邃紫罗兰色 (#7B62A0) + 鲜红凶萌眼睛',
    expectedPokemonId: 94,
    shouldMatch: true,
    generateCanvas: () => {
      const c = new MockCanvas(300, 300);
      c.fill(215, 215, 220);
      c.fillCircle(150, 150, 95, 115, 55, 145); // 深紫罗兰色
      c.fillCircle(120, 135, 14, 220, 25, 25);  // 红色瞳仁
      c.fillCircle(180, 135, 14, 220, 25, 25);
      c.addNoise(10);
      return c;
    }
  },
  {
    id: 'TP-FAIRY-01',
    name: '胖丁 (柔和粉红 + 青蓝大眼)',
    category: 'POSITIVE',
    description: '胖丁玩偶：球形柔和粉红 (#F85888/粉) + 青蓝色大眼睛',
    expectedPokemonId: 39,
    shouldMatch: true,
    generateCanvas: () => {
      const c = new MockCanvas(300, 300);
      c.fill(225, 225, 230);
      c.fillCircle(150, 150, 95, 245, 155, 175); // 柔和粉红
      c.fillCircle(120, 140, 20, 40, 160, 210);  // 青蓝大眼睛
      c.fillCircle(180, 140, 20, 40, 160, 210);
      c.addNoise(10);
      return c;
    }
  },
  {
    id: 'TP-NORMAL-01',
    name: '伊布 (深棕毛发 + 奶油白领毛围脖)',
    category: 'POSITIVE',
    description: '伊布玩偶：深暖棕色体色 + 颈部一圈蓬松的奶油白/浅米色毛领',
    expectedPokemonId: 133,
    shouldMatch: true,
    generateCanvas: () => {
      const c = new MockCanvas(300, 300);
      c.fill(210, 215, 220);
      c.fillCircle(150, 130, 70, 145, 85, 45);   // 伊布深棕头部
      c.fillCircle(150, 185, 55, 235, 225, 185); // 颈部蓬松奶油白领毛
      c.addNoise(10);
      return c;
    }
  },
  {
    id: 'TP-NORMAL-02',
    name: '卡比兽 (深藏青体色 + 奶油米白大肚)',
    category: 'POSITIVE',
    description: '卡比兽：深海藏青色身体 + 扁圆的奶油白色肚皮',
    expectedPokemonId: 143,
    shouldMatch: true,
    generateCanvas: () => {
      const c = new MockCanvas(300, 300);
      c.fill(220, 220, 220);
      c.fillCircle(150, 150, 95, 30, 85, 100);   // 深青/藏青
      c.fillCircle(150, 160, 55, 235, 225, 190); // 米白肚皮
      c.addNoise(10);
      return c;
    }
  },

  // ==========================================
  // B. 负向干扰测试 (True Negatives, 必须为 null)
  // ==========================================
  {
    id: 'TN-WOOD-01',
    name: '木纹实木桌面',
    category: 'NEGATIVE',
    description: '镜头对着红棕色木质桌面，必须返回 null（不能误判为伊布或小火龙）',
    shouldMatch: false,
    generateCanvas: () => {
      const c = new MockCanvas(300, 300);
      c.fill(140, 85, 48); // 纯红棕木色
      c.addNoise(15);
      return c;
    }
  },
  {
    id: 'TN-WALL-01',
    name: '白墙 / 打印纸',
    category: 'NEGATIVE',
    description: '镜头对着大白墙或白纸，必须返回 null',
    shouldMatch: false,
    generateCanvas: () => {
      const c = new MockCanvas(300, 300);
      c.fill(242, 244, 245);
      c.addNoise(4);
      return c;
    }
  },
  {
    id: 'TN-KB-01',
    name: '黑色机械键盘',
    category: 'NEGATIVE',
    description: '镜头对着深黑色电脑键盘，必须返回 null',
    shouldMatch: false,
    generateCanvas: () => {
      const c = new MockCanvas(300, 300);
      c.fill(32, 32, 36);
      c.addNoise(8);
      return c;
    }
  },
  {
    id: 'TN-NOTE-01',
    name: '黄色便利贴 (无辅色纯单色)',
    category: 'NEGATIVE',
    description: '纯黄色便利贴：缺乏皮卡丘的红脸颊与黑色耳尖特征，属于纯日常物品，应拒绝识别',
    shouldMatch: false,
    generateCanvas: () => {
      const c = new MockCanvas(300, 300);
      c.fill(220, 220, 220);
      c.fillCircle(150, 150, 85, 255, 235, 30);
      c.addNoise(3);
      return c;
    }
  },
  {
    id: 'TN-APPLE-01',
    name: '红富士苹果 / 红色水杯',
    category: 'NEGATIVE',
    description: '红苹果：单一纯红色球体，缺乏小火龙的奶油黄腹部等复合特征，应拒绝识别',
    shouldMatch: false,
    generateCanvas: () => {
      const c = new MockCanvas(300, 300);
      c.fill(210, 210, 210);
      c.fillCircle(150, 150, 80, 215, 25, 30); // 纯红
      c.addNoise(4);
      return c;
    }
  },
  {
    id: 'TN-PLANT-01',
    name: '绿色盆栽植物叶片',
    category: 'NEGATIVE',
    description: '大自然植物：叶绿素橄榄绿 (#406020)，非动漫纯绿/青绿，且无花苞特征，应拒绝识别',
    shouldMatch: false,
    generateCanvas: () => {
      const c = new MockCanvas(300, 300);
      c.fill(200, 200, 200);
      c.fillCircle(150, 150, 85, 70, 105, 35); // 植物暗绿
      c.addNoise(8);
      return c;
    }
  },
  {
    id: 'TN-JEANS-01',
    name: '纯棉牛仔裤蓝布料',
    category: 'NEGATIVE',
    description: '深蓝粗糙织物牛仔裤，缺乏水系宝可梦的浅腹背壳双色结构，应拒绝识别',
    shouldMatch: false,
    generateCanvas: () => {
      const c = new MockCanvas(300, 300);
      c.fill(45, 75, 120); // 单一牛仔蓝
      c.addNoise(12);
      return c;
    }
  },
  {
    id: 'TN-DARK-01',
    name: '遮挡镜头 / 极暗环境',
    category: 'NEGATIVE',
    description: '照度极低（< 25），必须判定为未匹配',
    shouldMatch: false,
    generateCanvas: () => {
      const c = new MockCanvas(300, 300);
      c.fill(18, 16, 17);
      c.addNoise(4);
      return c;
    }
  },
  {
    id: 'TN-BLOWN-01',
    name: '泛白强光直射 / 严重过曝',
    category: 'NEGATIVE',
    description: '照度极高（> 245），无饱和度，必须判定为未匹配',
    shouldMatch: false,
    generateCanvas: () => {
      const c = new MockCanvas(300, 300);
      c.fill(250, 250, 252);
      c.addNoise(2);
      return c;
    }
  },

  {
    id: 'TP-GRASS-03',
    name: '走路草 (深蓝身体 + 鲜绿草叶)',
    category: 'POSITIVE',
    description: '走路草：深蓝身体 + 头顶鲜绿草叶',
    expectedPokemonId: 43,
    acceptableIds: [43, 1],
    shouldMatch: true,
    generateCanvas: () => {
      const c = new MockCanvas(300, 300);
      c.fill(220, 220, 220);
      c.fillCircle(150, 160, 60, 45, 65, 140);  // 深蓝身体
      c.fillCircle(150, 100, 40, 60, 175, 45);  // 绿草头顶
      c.fillCircle(135, 150, 8, 220, 30, 30);   // 红眼睛
      c.fillCircle(165, 150, 8, 220, 30, 30);
      c.addNoise(10);
      return c;
    }
  },
  {
    id: 'TP-FAIRY-02',
    name: '皮皮 (浅粉色 + 棕色耳尖)',
    category: 'POSITIVE',
    description: '皮皮：浅粉色圆体 + 棕色耳尖',
    expectedPokemonId: 35,
    acceptableIds: [35, 39],
    shouldMatch: true,
    generateCanvas: () => {
      const c = new MockCanvas(300, 300);
      c.fill(225, 225, 230);
      c.fillCircle(150, 150, 90, 250, 180, 190); // 浅粉红
      c.fillCircle(105, 90, 14, 130, 75, 40);    // 棕耳尖
      c.fillCircle(195, 90, 14, 130, 75, 40);
      c.addNoise(8);
      return c;
    }
  },

  // ==========================================
  // C. 混淆抗阻对决测试 (Disambiguation)
  // ==========================================
  {
    id: 'DA-PIKA-EEVEE-01',
    name: '抗混淆：暖光偏暗皮卡丘 vs 伊布',
    category: 'DISAMBIGUATION',
    description: '色温极其偏黄偏暗（R=235, G=175, B=25），但黄色身体及脸颊红点特征明显，绝不可错判为伊布',
    expectedPokemonId: 25,
    shouldMatch: true,
    generateCanvas: () => {
      const c = new MockCanvas(300, 300);
      c.fill(160, 140, 120);
      c.fillCircle(150, 150, 90, 235, 175, 25);
      c.fillCircle(120, 160, 15, 210, 40, 30);
      c.fillCircle(180, 160, 15, 210, 40, 30);
      c.addNoise(10);
      return c;
    }
  },
  {
    id: 'DA-HAND-SKIN-01',
    name: '抗混淆：小朋友手部肉色靠近',
    category: 'NEGATIVE',
    description: '镜头前被大面积手掌浅肉色（R=225, G=185, B=165）遮挡，无特征点，必须拒绝',
    shouldMatch: false,
    generateCanvas: () => {
      const c = new MockCanvas(300, 300);
      c.fill(225, 185, 165); // 纯肤色肉色
      c.addNoise(6);
      return c;
    }
  }
];

// Run benchmark
async function runBenchmark() {
  console.log('================================================================');
  console.log('⚡ Pokédex Detector Precision Benchmark Suite');
  console.log(`⚡ Total Test Cases: ${testCases.length}`);
  console.log('================================================================\n');

  let passedCount = 0;
  let failedCount = 0;

  let truePositives = 0;
  let falseNegatives = 0;
  let trueNegatives = 0;
  let falsePositives = 0;

  for (const tc of testCases) {
    const canvas = tc.generateCanvas();
    const result = detectPokemonByLocalHeuristics(canvas as any);

    let isPass = false;
    let detailMessage = '';

    if (tc.shouldMatch) {
      if (!result) {
        isPass = false;
        falseNegatives++;
        detailMessage = `❌ 漏检 (False Negative): 期望识别 [${tc.expectedPokemonId}]，但返回 null`;
      } else {
        const detectedId = result.pokemon.id;
        const acceptable = tc.acceptableIds || [tc.expectedPokemonId!];
        if (acceptable.includes(detectedId)) {
          isPass = true;
          truePositives++;
          detailMessage = `✅ 命中: ${result.pokemon.name} (#${detectedId}, 置信度 ${result.confidence}%)`;
        } else {
          isPass = false;
          detailMessage = `❌ 类别混淆 (Misclassification): 期望 [#${tc.expectedPokemonId}]，实测识别为 [${result.pokemon.name} #${detectedId}]`;
        }
      }
    } else {
      if (result === null) {
        isPass = true;
        trueNegatives++;
        detailMessage = `✅ 正确拒绝 (True Negative): 返回 null (未发现宝可梦)`;
      } else {
        isPass = false;
        falsePositives++;
        detailMessage = `❌ 误报 (False Positive): 干扰物被错误识别为 [${result.pokemon.name} #${result.pokemon.id}]`;
      }
    }

    if (isPass) {
      passedCount++;
      console.log(`[PASS] [${tc.category}] ${tc.name}`);
      console.log(`       ${detailMessage}`);
    } else {
      failedCount++;
      console.log(`[FAIL] [${tc.category}] ${tc.name}`);
      console.log(`       ${detailMessage}`);
      console.log(`       描述: ${tc.description}`);
    }
  }

  const total = testCases.length;
  const passRate = ((passedCount / total) * 100).toFixed(1);
  const totalPos = truePositives + falseNegatives;
  const recall = totalPos > 0 ? ((truePositives / totalPos) * 100).toFixed(1) : '100';
  const totalNeg = trueNegatives + falsePositives;
  const fpRate = totalNeg > 0 ? ((falsePositives / totalNeg) * 100).toFixed(1) : '0';

  console.log('\n================================================================');
  console.log('📊 Benchmark Results Summary:');
  console.log(`   Total Tests:        ${total}`);
  console.log(`   Passed:             ${passedCount} / ${total} (${passRate}%)`);
  console.log(`   Failed:             ${failedCount} / ${total}`);
  console.log('----------------------------------------------------------------');
  console.log(`   Recall (正向检出率):   ${recall}% (${truePositives}/${totalPos})`);
  console.log(`   False Positive Rate:  ${fpRate}% (${falsePositives}/${totalNeg})`);
  console.log('================================================================\n');

  if (failedCount > 0) {
    process.exit(1);
  }
}

runBenchmark().catch(err => {
  console.error('Benchmark error:', err);
  process.exit(1);
});
