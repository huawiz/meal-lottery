import { useState, useEffect, useMemo } from "react";

/* ==========================================================
   菜單資料（營養師規劃之減脂減醣菜單）
   結構完全依照原始海報：每個熱量 3 組菜單表，
   每組有 組合一 ~ 組合五。抽籤池由此展開，表格模式直接照原樣呈現。
   ========================================================== */

const SERVINGS = {
  1600: { 澱粉: "8~9份", 豆魚蛋肉: "8~10份", 油脂: "4~6份", 蔬菜: "4份", 水果: "1份", 乳品: "1份" },
  1800: { 澱粉: "9~10份", 豆魚蛋肉: "9~10份", 油脂: "6份", 蔬菜: "6份", 水果: "1份", 乳品: "1份" },
  2000: { 澱粉: "12份", 豆魚蛋肉: "12份", 油脂: "6份", 蔬菜: "6份", 水果: "1份", 乳品: "1份" },
};

const MEAL_ORDER = {
  1600: ["早餐", "午餐", "晚餐", "點心"],
  1800: ["早餐", "午餐", "晚餐", "點心"],
  2000: ["早餐", "午餐", "午後點心", "晚餐", "晚間點心"],
};

// c(店家, 品項...)
const c = (store, ...items) => ({ store, items });
const s = (...items) => ({ store: null, items }); // 點心：無店家

const RAW = {
  1600: [
    // ── 第 1 組 ──
    {
      早餐: [
        c("麥味登", "原塊嫩雞滿福堡夾蛋去醬", "無糖綠茶"),
        c("早餐店", "豬里肌蛋吐司去醬", "中熱美"),
        c("7-11", "豬紐奧良雞肉三明治", "無糖高纖豆漿 ×1"),
        c("拉亞", "韓式烤牛芝加哥堡去醬", "無糖綠"),
        c("路易莎", "豬肉起司＋蛋滿福堡", "無糖茶"),
      ],
      午餐: [
        c("八方", "菜肉餛飩大炒手", "貢丸湯", "燙蔬菜去醬"),
        c("Subway", "六吋淺艇堡（炙燒牛肉／鄉村雞柳／照燒雞）", "加嫩蛋一片", "橄欖油／紅酒醋／黃芥末"),
        c("Sukiya", "溫玉／燒烤雞肉丼迷你碗", "燙蔬菜套餐", "味噌湯"),
        c("壽司店", "8~9顆壽司", "茶碗蒸一份", "味噌湯", "蔬菜2~3樣"),
        c("摩斯", "蜜汁烤雞堡", "雞肉地瓜總匯沙拉", "無糖紅茶"),
      ],
      晚餐: [
        c("雞肉飯", "雞肉飯小份", "皮蛋豆腐", "燙蔬菜去醬"),
        c("全家", "健身G肉餐盒", "蔥鹽雞肉沙拉", "無糖高纖豆漿"),
        c("鹹水雞", "蓮藕＋馬鈴薯一份", "去皮雞腿肉小份", "蔬菜三樣不醬"),
        c("鐵板燒", "飯減少1/3", "雞腿肉去皮醬少", "蔥蛋一顆", "蔬菜全吃醬少"),
        c("滷味", "冬粉一把", "嘴邊肉一份", "豆乾四片", "蔬菜2~3樣"),
      ],
      點心: [
        s("蘋果一顆", "鹽味毛豆一包"),
        s("芭樂半顆", "石安牧場溫泉蛋"),
        s("小蕃茄20顆", "爆炒魯雞胗 1/2包"),
        s("奇異果一顆", "茶碗蒸一顆"),
        s("藍莓一盒約100g", "無糖豆漿一杯"),
      ],
    },
    // ── 第 2 組 ──
    {
      早餐: [
        c("超商", "蒸地瓜25元", "桂格豆漿燕麥飲", "茶葉蛋兩顆"),
        c("中式早餐店", "饅頭夾蔥蛋", "無糖豆漿"),
        c("麥味登", "豬排湯種夾蛋去醬", "無糖綠茶"),
        c("路易莎", "鮪魚全麥吐司去醬", "嫩蛋一顆", "中熱美"),
        c("超商", "凱薩雞肉捲餅", "無糖高纖豆漿 ×1"),
      ],
      午餐: [
        c("全家", "清炒蒜香海鮮義大利麵", "蔥鹽雞肉沙拉"),
        c("自助餐", "飯2/3碗", "L型大雞腿一隻", "蔬菜3樣"),
        c("八方", "水餃8顆", "涼拌豆腐一份", "燙蔬菜去醬"),
        c("麥當勞", "麥香魚去醬", "雞肉沙拉一份", "零熱量飲品"),
        c("超商", "御飯糰", "雞胸肉一片", "豆漿一瓶", "小滷蔬菜一份"),
      ],
      晚餐: [
        c("潮味決", "蒸煮麵", "肉多多套餐", "火鍋料1~2樣"),
        c("健康餐盒", "雞或豬肉", "飯一半", "加蛋 ×1"),
        c("全家", "高蛋白餐盒", "蒸大豆一包", "四季沙拉一盒"),
        c("滷味", "烏龍麵一包", "大黑豆干一塊", "豬肉一份", "蔬菜2~3樣"),
        c("火鍋", "冬粉一份或半碗飯", "肉類 4 oz", "不吃加工物"),
      ],
      點心: [
        s("葡萄10顆", "統一布丁小顆"),
        s("小香蕉一條", "綠竹筍排骨湯"),
        s("橘子一顆", "海鮮風味茶碗蒸一顆"),
        s("火龍果一碗", "中華豆花 ×1"),
        s("鳳梨半碗", "黑丸嫩仙草 ×1"),
      ],
    },
    // ── 第 3 組 ──
    {
      早餐: [
        c("中式早餐店", "豆芽菜蛋餅", "無糖豆漿"),
        c("麥味登", "豆皮雙蛋蔬蛋餅", "紐西蘭牛奶"),
        c("7-11", "桂格豆漿燕麥飲 ×1", "光泉無糖濃豆漿 ×1"),
        c("Qburger", "怪獸總匯蛋餅", "無糖豆漿一杯"),
        c("摩斯", "番茄吉士堡", "無糖紅茶"),
      ],
      午餐: [
        c("拉亞", "韓式烤肉拌飯（飯減少1/3）", "無糖茶"),
        c("全家", "清炒蒜香蛤蜊義大利麵", "田園沙拉（醬少）", "無糖黑豆漿 ×1"),
        c("全家", "日式胡麻雞肉冷麵", "辣味雞胸肉 ×1", "小滷蔬菜一包"),
        c("麥當勞", "嫩煎雞腿堡去醬", "烤雞沙拉去皮醬少", "無糖茶"),
        c("Poke", "菜多不點飯", "雞蛋一顆", "蔬菜3~4樣", "蘋果一顆"),
      ],
      晚餐: [
        c("雞肉飯", "雞肉飯小份", "嘴邊肉湯", "燙蔬菜去醬"),
        c("自助餐", "飯2/3碗", "L型大雞腿一隻", "蔬菜3樣"),
        c("小火鍋", "飯2/3碗量（去冬粉、去火鍋料）", "不吃米血", "海鮮豆腐鍋湯酌量"),
        c("麵店", "清燉牛肉麵減1/3", "燙蔬菜一份去醬"),
        c("全家／自備", "冰心地瓜一包150g", "雞蛋兩顆＋雞胸一包", "燙蔬菜一包", "堅果10顆"),
      ],
      點心: [
        s("無糖豆漿燕麥飲一罐", "雞蛋一顆"),
        s("超能低脂高蛋白一罐"),
        s("地瓜25元100g", "乳清 1/2包"),
        s("藍莓一盒", "無糖優格一顆"),
        s("高蛋白穀物棒一根"),
      ],
    },
  ],

  1800: [
    // ── 第 1 組 ──
    {
      早餐: [
        c("中式早餐店", "饅頭夾蔥蛋＋豬排", "無糖豆漿"),
        c("麥味登", "好食嫩雞餐", "鮮奶茶"),
        c("Qburger", "黑松露蕈菇嫩雞堡去醬", "無糖綠"),
        c("麥味登", "優蛋白蛋白卷餐", "紐西蘭牛奶"),
        c("麥味登", "蘑菇鐵板麵去醬", "豬里肌一片", "無糖茶"),
      ],
      午餐: [
        c("全家", "五味五彩嫩雞餐盒", "蘋果油醋雞肉麵沙拉", "每日健康一罐"),
        c("星巴克", "經典總匯三明治", "特調冷萃"),
        c("Sukiya", "蔥溫玉燒烤雞肉丼小碗", "燙蔬菜套餐"),
        c("Subway", "香烤雞肉／燒烤牛肉任選餡包6吋", "紅酒醋／蜂蜜芥末醬／橄欖油", "避免醃漬物"),
        c("全家", "海陸雙鮮手捲", "日式茶碗蒸", "蒜頭雞燉湯"),
      ],
      晚餐: [
        c("三商巧福", "清燉牛肉麵", "燙蔬菜去肉燥", "滷蛋一顆"),
        c("池上便當", "飯全吃、避炸物", "L型大雞腿去皮／招牌肉片", "蔬菜太油過水"),
        c("7-11", "豆酥烤魚鮮蔬餐盒", "無糖高纖豆漿一罐"),
        c("潮味決", "健人最愛高蛋白套餐", "蒸煮麵／冬粉／烏龍麵", "豚骨／越式／紅蕃茄"),
        c("肯德基", "義式香料紙包雞去皮", "純生菜一盒", "無糖綠茶", "玉米一根 or 冰心地瓜一包"),
      ],
      點心: [
        s("黑丸招牌仙草吸凍飲", "糖心蛋一顆"),
        s("黑丸冬瓜檸檬吸凍飲", "茶葉蛋一顆"),
        s("晶典小品・茉莉茶凍", "石安牧場糖心蛋一包"),
        s("中華豆花一盒", "茶葉蛋一顆"),
        s("希臘優格一顆", "堅果8顆"),
      ],
    },
    // ── 第 2 組 ──
    {
      早餐: [
        c("摩斯", "杏鮑菇珍珠堡（醬汁少）", "牛奶一杯"),
        c("全家", "鮪魚濾心蛋三明治", "無糖濃豆漿"),
        c("拉亞", "厚切里肌蛋吐司去醬", "無糖茶"),
        c("全家", "豬肉起司蛋堡", "蘋果油醋雞肉沙拉", "無糖黑豆漿"),
        c("全家", "豬肉起司蛋堡", "蘋果油醋雞肉沙拉", "無糖黑豆漿"),
      ],
      午餐: [
        c("Subway＋超商", "超商地瓜30元", "香烤雞肉／燒烤牛肉沙拉＋嫩蛋一片", "紅酒醋／蜂蜜芥末醬／橄欖油", "避免醃漬物"),
        c("星巴克", "舒肥雞鮮蔬帕里尼", "特調冷萃"),
        c("全家", "大口麻婆豆腐飯糰", "雞胸肉一包", "彩虹10蔬湯"),
        c("Sukiya", "秋葵牛丼／蘿蔔泥牛丼小碗", "燙蔬菜套餐", "加點牛肉一份／溫泉蛋一顆"),
        c("摩斯", "蜜汁烤雞起司堡", "夏威夷沙拉", "紅茶歐蕾一分糖"),
      ],
      晚餐: [
        c("三商巧福", "排骨麵", "燙蔬菜去肉燥", "滷蛋一顆"),
        c("7-11", "黑胡椒烤雞握便當", "無糖豆漿一瓶400ml", "凱薩雞肉沙拉"),
        c("大埔鐵板燒", "飯一平碗", "雞／牛／羊去醬", "加點鐵板豆腐／蔥蛋一顆"),
        c("7-11", "增肌蛋白餐", "小魯蔬菜一包", "無糖麥茶一罐"),
        c("潮味決", "133飲控餐盤套餐", "蒸煮麵／冬粉／烏龍麵", "豚骨／越式／紅蕃茄"),
      ],
      點心: [
        s("蘋果一顆", "無糖豆漿一杯"),
        s("火龍果 1/4顆", "茶葉蛋一顆"),
        s("奇異果一顆", "茶碗蒸一顆"),
        s("藍莓一盒100g", "冷凍薄鹽毛豆莢一包"),
        s("小蕃茄20顆", "雞肉棒一條"),
      ],
    },
    // ── 第 3 組 ──
    {
      早餐: [
        c("摩斯", "雞肉三明治（醬汁少）", "拿鐵"),
        c("7-11", "雙蔬鮪魚御飯團", "茶葉蛋兩顆", "無糖高纖豆漿 ×1"),
        c("中式早餐店", "豬排蛋餅", "鹹豆漿去油條"),
        c("7-11", "豬肉吉士堡", "茶葉蛋兩顆", "桂格顆粒燕麥飲 ×1"),
        c("全家", "無糖拿鐵大杯", "茶葉蛋兩顆", "田園沙拉一盒"),
      ],
      午餐: [
        c("全家", "柚香海藻冷麵", "關東煮蔬菜三樣", "無糖高纖豆漿"),
        c("星巴克", "櫛瓜烘蛋巧巴達", "拿鐵大杯"),
        c("摩斯", "和風炸雞去皮兩隻", "雞肉地瓜總匯沙拉", "冰橙咖啡"),
        c("自助餐", "飯一平碗量", "排骨一片", "雞蛋一顆", "蔬菜三樣拳頭大"),
        c("全家", "大口雞肉親子丼飯糰", "海藻沙拉一盒", "蛋白丁一包"),
      ],
      晚餐: [
        c("三商巧福", "紅燒牛肉麵", "燙蔬菜去肉燥", "豆乾一盤"),
        c("夏威夷生魚飯", "營養糙米", "蛋白質任選三種", "蔬菜任選兩種", "醬汁清淡"),
        c("7-11", "滑蛋嫩雞親子丼", "四季和風沙拉", "每日健康一罐"),
        c("麥當勞", "嫩煎雞腿堡 or 板烤雞腿堡（醬汁少）", "烤雞沙拉去皮", "無糖優酪乳小罐"),
        c("全家", "大口雞肉親子丼飯糰", "海藻沙拉一盒", "蛋白丁一包"),
      ],
      點心: [
        s("小香蕉一條", "真空小豆乾兩片"),
        s("橘子一顆", "真空滷蛋一顆"),
        s("柳丁一顆", "乳清半包"),
        s("無糖優酪乳小罐"),
        s("希臘優格一顆", "藍莓半碗"),
      ],
    },
  ],

  2000: [
    // ── 第 1 組 ──
    {
      早餐: [
        c("7-11", "凱薩風味嫩雞鮮蔬捲餅", "糖心蛋紐奧良風味三明治"),
        c("麥當勞", "豬肉滿福堡加蛋", "牛奶一瓶"),
        c("麥味登", "蛋白力量飯卷（紐奧良烤雞風味）", "石安牧場糖心蛋飯糰"),
        c("路易莎", "麥香鮪魚吐司夾嫩蛋及鮪魚", "無糖拿鐵中杯"),
        c("Qberger", "活力菲力雞套餐", "蕈菇嫩蛋捲"),
      ],
      午餐: [
        c("麥味登", "時蔬豆皮蛋餅特餐", "鮮蛋沙拉湯種", "無糖鮮奶茶"),
        c("雞肉飯", "雞肉飯大份", "嘴邊肉一份", "豆腐蔬菜湯", "滷蛋一顆", "燙蔬菜去醬"),
        c("Subway", "香烤雞肉小麥麵包12吋", "紅酒醋／蜂蜜芥末醬／橄欖油"),
        c("7-11", "北海道蕎麥風味沾麵", "雞胸肉一包", "優酪乳一瓶"),
        c("福勝亭", "醬烤雞腿定食", "飯全吃"),
      ],
      午後點心: [
        s("無糖優格一盒"),
        s("優菓甜坊銀耳蓮子湯", "茶葉蛋一顆"),
        s("穀物棒一根"),
        s("超商煙燻鴨賞"),
        s("牛奶240ml"),
      ],
      晚餐: [
        c("鐵板燒", "請老闆調味清淡", "炒海鮮", "加點雞腿排（去皮）", "飯一碗"),
        c("悟饕", "挪威鯖魚飯包", "飯全吃"),
        c("Sukiya", "溫玉燒烤雞肉丼中盛", "青菜套餐"),
        c("摩斯", "超級大麥元氣魔力珍珠堡", "雞塊四塊", "夏威夷沙拉一盒"),
        c("健康餐盒", "雙主菜", "飯全吃"),
      ],
      晚間點心: [
        s("香蕉一根"),
        c("全家", "照燒雞腿肉串"),
        c("全家", "媽媽煮藝烤腿條"),
        c("7-11", "綠竹筍排骨湯"),
        c("7-11", "香菇雞湯"),
      ],
    },
    // ── 第 2 組 ──
    {
      早餐: [
        c("永和豆漿", "饅頭里肌蛋", "無糖豆漿一杯"),
        c("7-11", "吉士豬肉堡加蛋", "烤雞纖穀時蔬沙拉餐"),
        c("Qberger", "黑松露蕈菇菲力雞軟法", "配餐：紅茶＋沙拉"),
        c("早餐店", "燻雞蛋堡", "蔬菜蛋餅", "無糖豆漿一杯"),
        c("路易莎", "義式里肌豬吐司夾嫩蛋一顆", "無糖小農拿鐵中杯"),
      ],
      午餐: [
        c("麥味登", "紫米時蔬嫩雞飯", "時蔬嫩蛋一份", "無糖鮮奶茶"),
        c("八方雲集", "古早味湯麵一碗", "皮蛋豆腐一份", "豆漿一杯", "燙青菜去醬"),
        c("7-11", "香蒜白酒蛤蜊義大利麵", "雞柳條一包", "沙拉一盒", "無糖綠茶"),
        c("燒臘便當", "油雞腿／烤鴨去皮", "配菜選蔬菜", "加一顆荷包蛋", "飯全吃"),
        c("大戶屋", "炭烤雞肉蛋蓋飯", "飯全吃", "鮮蔬小魚"),
      ],
      午後點心: [
        c("7-11", "雞肉蛋白棒"),
        c("7-11", "凱薩風味嫩雞鮮蔬捲餅"),
        s("穀物棒一根"),
        s("優酪乳一瓶240ml"),
        c("全家", "蒜香綜合滷味"),
      ],
      晚餐: [
        c("7-11", "增肌蛋白餐"),
        c("韓式料理", "石鍋拌飯", "飯全吃"),
        c("悟饕", "蒜香雞菲力飯包", "飯全吃"),
        c("7-11", "香草烤雞腿時蔬餐", "鮮奶豆漿一瓶", "沙拉一盒"),
        c("21世紀plus", "香草烤雞腿一隻", "時蔬雞汁飯", "綠茶", "薯條中份"),
      ],
      晚間點心: [
        c("7-11", "香草烤雞沙拉"),
        c("7-11", "恩美萊紅切達起司棒"),
        c("7-11", "美威湖鹽鮭魚棒"),
        c("7-11", "博客海鹽嫩雞胸"),
        s("芭樂一顆"),
      ],
    },
    // ── 第 3 組 ──
    {
      早餐: [
        c("麥當勞", "起司番茄嫩蛋貝果堡", "拿鐵一杯"),
        c("全家", "豬肉起司蛋堡", "燕麥飲一瓶"),
        c("全家", "海陸雙手捲", "無糖豆奶鮮奶"),
        c("路易莎", "烤腿排麥香吐司", "莊園拿鐵中杯"),
        c("早餐店", "里肌蛋餅", "無糖鮮奶茶一杯"),
      ],
      午餐: [
        c("小火鍋", "海鮮豆腐鍋＋加一顆蛋＋嫩肉片", "飯一碗、火鍋料換菜", "不沾醬不喝湯"),
        c("全家", "海陸雙拼肉肉餐盒"),
        c("麥當勞", "BLT 嫩煎雞腿堡", "雞塊四塊", "四季沙拉", "無糖綠茶"),
        c("爭鮮", "壽司10貫", "茶碗蒸一份", "毛豆一份", "生魚片一盤"),
        c("自助餐", "飯平碗160g", "青菜一拳頭", "滷蛋一顆", "肉類去皮1手掌大"),
      ],
      午後點心: [
        s("無糖豆漿豆花"),
        s("優酪乳一瓶240ml"),
        c("7-11", "原之果實小蜜柑鮮果凍"),
        s("優菓甜坊蒟蒻薏仁綠豆湯"),
        c("全家", "青醬優格雞肉沙拉"),
      ],
      晚餐: [
        c("波奇碗", "全飯", "蛋白質選雞胸（肉雙倍）", "配料選毛豆", "醬料避開美乃滋"),
        c("肯德基", "紙包雞去皮", "雞汁飯一碗", "雞塊四塊", "沙拉一盒"),
        c("韓式料理", "原味豆腐鍋", "飯全吃"),
        c("7-11", "香烤雞胸鮮蔬餐", "茶葉蛋一顆"),
        c("大戶屋", "炭烤雞肉香橘醋定食", "飯全吃", "芝麻拌鮮蔬"),
      ],
      晚間點心: [
        s("茶碗蒸一個"),
        s("玉子燒一個"),
        s("蘋果兩顆"),
        s("地瓜25元"),
        c("全家", "照燒雞腿肉串"),
      ],
    },
  ],
};

const MEAL_ICON = { 早餐: "☀", 午餐: "🍱", 晚餐: "🌙", 點心: "🍡", 午後點心: "🍡", 晚間點心: "🍢" };

/* ---------- 抽籤邏輯 ---------- */

const stamp = (r) => (r ? (r.store || "") + "|" + r.items.join(",") : "");

function buildPools(cal) {
  const pools = {};
  MEAL_ORDER[cal].forEach((m) => {
    const seen = new Set();
    pools[m] = [];
    RAW[cal].forEach((block) => {
      (block[m] || []).forEach((combo) => {
        const key = stamp(combo);
        if (!seen.has(key)) { seen.add(key); pools[m].push(combo); }
      });
    });
  });
  return pools;
}

const NUM_CN = ["一", "二", "三", "四", "五"];

function buildDayCombos(cal) {
  const list = [];
  RAW[cal].forEach((block, bi) => {
    for (let ci = 0; ci < 5; ci++) {
      const meals = {};
      MEAL_ORDER[cal].forEach((m) => { meals[m] = block[m][ci]; });
      list.push({ label: `第${bi + 1}組・組合${NUM_CN[ci]}`, meals });
    }
  });
  return list;
}

function drawOne(pool, avoidStamp) {
  if (!pool || pool.length === 0) return null;
  let pick = pool[Math.floor(Math.random() * pool.length)];
  if (pool.length > 1 && avoidStamp) {
    let guard = 0;
    while (stamp(pick) === avoidStamp && guard < 12) {
      pick = pool[Math.floor(Math.random() * pool.length)];
      guard++;
    }
  }
  return pick;
}

/* ---------- 元件 ---------- */

export default function MealLottery() {
  const [view, setView] = useState("draw"); // 'draw' | 'table'
  const [cal, setCal] = useState(1600);
  const [mode, setMode] = useState("day");
  const [dayStyle, setDayStyle] = useState("set"); // 'set' 照組合抽 | 'mix' 自由混搭
  const [setLabel, setSetLabel] = useState(null);
  const [results, setResults] = useState(null);
  const [shaking, setShaking] = useState(false);
  const [exportData, setExportData] = useState(null); // { url, blob, name }
  const [drawCount, setDrawCount] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    if (typeof window.matchMedia !== "function") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduceMotion(mq.matches);
    const fn = (e) => setReduceMotion(e.matches);
    mq.addEventListener?.("change", fn);
    return () => mq.removeEventListener?.("change", fn);
  }, []);

  const pools = useMemo(() => buildPools(cal), [cal]);
  const dayCombos = useMemo(() => buildDayCombos(cal), [cal]);
  const meals = MEAL_ORDER[cal];

  /* 商家篩選：空陣列 = 不限商家 */
  const [pickedStores, setPickedStores] = useState([]);
  const filterActive = pickedStores.length > 0;

  const storeStats = useMemo(() => {
    const map = new Map();
    MEAL_ORDER[cal].forEach((m) =>
      pools[m].forEach((cb) => { if (cb.store) map.set(cb.store, (map.get(cb.store) || 0) + 1); })
    );
    return [...map.entries()].sort((a, b) => b[1] - a[1]);
  }, [cal, pools]);

  const filteredPools = useMemo(() => {
    if (!filterActive) return pools;
    const set = new Set(pickedStores);
    const out = {};
    MEAL_ORDER[cal].forEach((m) => {
      // 無店家的點心（水果、乳品等）視為隨處可得，不受篩選影響
      out[m] = pools[m].filter((cb) => !cb.store || set.has(cb.store));
    });
    return out;
  }, [pools, pickedStores, filterActive, cal]);

  const toggleStore = (name) => {
    setPickedStores((prev) => prev.includes(name) ? prev.filter((s) => s !== name) : [...prev, name]);
    setResults(null);
    setSetLabel(null);
  };
  const clearStores = () => { setPickedStores([]); setResults(null); setSetLabel(null); };

  /* 關鍵字搜尋（表格模式）：跨三個熱量搜尋店家與品項 */
  const [query, setQuery] = useState("");
  /* 表格模式的餐別篩選：空陣列 = 全部 */
  const [tableMeals, setTableMeals] = useState([]);
  const toggleTableMeal = (m) => {
    setTableMeals((prev) => prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m]);
  };
  const visibleTableMeals = tableMeals.length ? meals.filter((m) => tableMeals.includes(m)) : meals;
  const q = query.trim();
  const searchHits = useMemo(() => {
    if (!q) return [];
    const ql = q.toLowerCase();
    const hits = [];
    [1600, 1800, 2000].forEach((cv) => {
      RAW[cv].forEach((block, bi) => {
        MEAL_ORDER[cv].forEach((m) => {
          (block[m] || []).forEach((cb, ci) => {
            const hay = ((cb.store || "") + " " + cb.items.join(" ")).toLowerCase();
            if (hay.includes(ql)) hits.push({ cal: cv, bi, ci, meal: m, combo: cb });
          });
        });
      });
    });
    return hits;
  }, [q]);

  const cellMatches = (cb) => {
    if (!q) return false;
    return ((cb.store || "") + " " + cb.items.join(" ")).toLowerCase().includes(q.toLowerCase());
  };

  const hl = (text) => {
    if (!q) return text;
    const t = String(text);
    const ql = q.toLowerCase();
    const tl = t.toLowerCase();
    const parts = [];
    let i = 0, idx, k = 0;
    while ((idx = tl.indexOf(ql, i)) !== -1) {
      if (idx > i) parts.push(t.slice(i, idx));
      parts.push(<mark key={k++} style={S.mark}>{t.slice(idx, idx + q.length)}</mark>);
      i = idx + q.length;
    }
    parts.push(t.slice(i));
    return parts;
  };

  const activeMode = mode === "day" || meals.includes(mode) ? mode : "day";
  const isSetDraw = activeMode === "day" && dayStyle === "set" && !filterActive;

  const doDraw = () => {
    const run = () => {
      if (isSetDraw) {
        let pick = dayCombos[Math.floor(Math.random() * dayCombos.length)];
        let guard = 0;
        while (setLabel && pick.label === setLabel && dayCombos.length > 1 && guard < 12) {
          pick = dayCombos[Math.floor(Math.random() * dayCombos.length)];
          guard++;
        }
        setResults({ ...pick.meals });
        setSetLabel(pick.label);
      } else {
        const next = {};
        const targets = activeMode === "day" ? meals : [activeMode];
        targets.forEach((m) => {
          const prev = results && results[m] ? stamp(results[m]) : null;
          next[m] = drawOne(filteredPools[m], prev);
        });
        setResults(activeMode === "day" ? next : { ...(results || {}), ...next });
        setSetLabel(null);
      }
      setDrawCount((n) => n + 1);
    };
    if (reduceMotion) { run(); return; }
    setShaking(true);
    setTimeout(() => { setShaking(false); run(); }, 550);
  };

  const redrawMeal = (m) => {
    const prev = results && results[m] ? stamp(results[m]) : null;
    setResults({ ...(results || {}), [m]: drawOne(filteredPools[m], prev) });
    setSetLabel(null); // 換掉單一餐後就不再是原本的整組
    setDrawCount((n) => n + 1);
  };

  /* 輸出今日籤圖片：純 Canvas，不需外部函式庫 */
  const exportImage = async () => {
    const targets = (activeMode === "day" ? meals : [activeMode]).filter((m) => results && results[m]);
    if (!targets.length) return;
    try { await document.fonts?.ready; } catch (e) { /* 字型未載入就用系統字體 */ }

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const W = 1080, PADX = 84;
    const CW = W - PADX * 2;
    const SANS = "'Noto Sans TC','PingFang TC','Microsoft JhengHei',sans-serif";
    const SERIF = "'Noto Serif TC','PingFang TC',serif";

    const wrap = (text, font, maxW) => {
      ctx.font = font;
      const out = [];
      let line = "";
      for (const ch of String(text)) {
        if (line && ctx.measureText(line + ch).width > maxW) { out.push(line); line = ch; }
        else line += ch;
      }
      if (line) out.push(line);
      return out;
    };
    const rrect = (x, y, w, h, r) => {
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.arcTo(x + w, y, x + w, y + h, r);
      ctx.arcTo(x + w, y + h, x, y + h, r);
      ctx.arcTo(x, y + h, x, y, r);
      ctx.arcTo(x, y, x + w, y, r);
      ctx.closePath();
    };

    const now = new Date();
    const weekCN = ["日", "一", "二", "三", "四", "五", "六"][now.getDay()];
    const dateStr = `${now.getFullYear()} 年 ${now.getMonth() + 1} 月 ${now.getDate()} 日（週${weekCN}）`;
    const ymd = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;

    // ── 版面計算與繪製共用一段流程：draw=false 先量高度，draw=true 實際繪製 ──
    const paint = (draw) => {
      let y = 96;
      const text = (t, font, color, size, align = "left", x = PADX) => {
        if (draw) {
          ctx.font = font; ctx.fillStyle = color; ctx.textAlign = align; ctx.textBaseline = "top";
          ctx.fillText(t, x, y);
        }
        y += size;
      };

      // 標題與日期
      if (draw) {
        ctx.font = `900 76px ${SERIF}`; ctx.fillStyle = "#2B2320"; ctx.textAlign = "center"; ctx.textBaseline = "top";
        ctx.fillText("今日食籤", W / 2, y);
      }
      y += 100;
      if (draw) {
        ctx.font = `500 34px ${SANS}`; ctx.fillStyle = "#6E5F52"; ctx.textAlign = "center";
        ctx.fillText(dateStr, W / 2, y);
      }
      y += 62;

      // 熱量／組合徽章
      const badge = setLabel ? `${cal} 大卡 ｜ ${setLabel}` : `${cal} 大卡`;
      ctx.font = `700 30px ${SANS}`;
      const bw = ctx.measureText(badge).width + 72;
      if (draw) {
        ctx.fillStyle = "#C8402A";
        rrect((W - bw) / 2, y, bw, 62, 31); ctx.fill();
        ctx.fillStyle = "#FFF6E9"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
        ctx.fillText(badge, W / 2, y + 33);
        ctx.textBaseline = "top";
      }
      y += 110;

      // 各餐區塊
      targets.forEach((m, idx) => {
        const r = results[m];
        // 餐別帶
        if (draw) {
          ctx.fillStyle = "#C8402A";
          rrect(PADX, y, 190, 56, 12); ctx.fill();
          ctx.font = `800 30px ${SANS}`; ctx.fillStyle = "#FFF6E9"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
          ctx.fillText(`${MEAL_ICON[m]} ${m}`, PADX + 95, y + 30);
          ctx.textBaseline = "top";
        }
        // 店家（與餐別帶同行右側）
        if (draw) {
          ctx.font = `900 44px ${SERIF}`; ctx.fillStyle = "#2B2320"; ctx.textAlign = "left";
          ctx.fillText(r.store || "點心組合", PADX + 220, y + 4);
        }
        y += 84;
        // 品項
        r.items.forEach((it) => {
          const lines = wrap("・" + it, `400 33px ${SANS}`, CW - 30);
          lines.forEach((ln) => {
            if (draw) {
              ctx.font = `400 33px ${SANS}`; ctx.fillStyle = "#4C4238"; ctx.textAlign = "left";
              ctx.fillText(ln, PADX + 16, y);
            }
            y += 48;
          });
        });
        // 虛線分隔
        if (idx < targets.length - 1) {
          y += 22;
          if (draw) {
            ctx.strokeStyle = "#DECBA6"; ctx.lineWidth = 2; ctx.setLineDash([10, 10]);
            ctx.beginPath(); ctx.moveTo(PADX, y); ctx.lineTo(W - PADX, y); ctx.stroke();
            ctx.setLineDash([]);
          }
          y += 40;
        }
      });

      // 頁尾
      y += 56;
      if (draw) {
        ctx.font = `400 24px ${SANS}`; ctx.fillStyle = "#A9977C"; ctx.textAlign = "center";
        ctx.fillText("菜單由營養師規劃・減脂減醣", W / 2, y);
      }
      y += 80;
      return y;
    };

    const H = paint(false);
    canvas.width = W; canvas.height = H;
    // 背景
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, "#FFF9EC"); g.addColorStop(1, "#F6E7C9");
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    // 外框
    ctx.strokeStyle = "#2B2320"; ctx.lineWidth = 6;
    rrect(24, 24, W - 48, H - 48, 28); ctx.stroke();
    paint(true);

    const name = `今日食籤_${ymd}.png`;
    canvas.toBlob((blob) => {
      if (!blob) return;
      setExportData({ url: URL.createObjectURL(blob), blob, name });
    }, "image/png");
  };

  const closeExport = () => {
    if (exportData) URL.revokeObjectURL(exportData.url);
    setExportData(null);
  };

  const shareExport = async () => {
    if (!exportData) return;
    const file = new File([exportData.blob], exportData.name, { type: "image/png" });
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try { await navigator.share({ files: [file] }); } catch (e) { /* 使用者取消分享 */ }
    } else {
      downloadExport();
    }
  };

  const downloadExport = () => {
    if (!exportData) return;
    const a = document.createElement("a");
    a.href = exportData.url;
    a.download = exportData.name;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const changeCal = (cNew) => {
    setCal(cNew);
    setResults(null);
    setSetLabel(null);
    setPickedStores([]); // 各熱量的商家清單不同，切換時重置
    setTableMeals([]); // 各熱量的餐別名稱不同（2000 卡有兩次點心），切換時重置
    if (mode !== "day" && !MEAL_ORDER[cNew].includes(mode)) setMode("day");
  };
  const changeMode = (m) => { setMode(m); setResults(null); setSetLabel(null); };
  const changeDayStyle = (st) => { setDayStyle(st); setResults(null); setSetLabel(null); };

  const shownMeals = results
    ? (activeMode === "day" ? meals : [activeMode]).filter((m) => m in results)
    : [];

  return (
    <div style={S.page}>
      <style>{CSS}</style>

      <header style={S.header}>
        <div style={S.eyebrow}>減脂減醣・外食族菜單</div>
        <h1 style={S.title}>今日食籤</h1>
        <p style={S.subtitle}>照著抽、照著吃，每天熱量控制在目標大卡左右</p>
      </header>

      {/* 模式切換 */}
      <div style={S.viewSwitch} role="tablist" aria-label="顯示模式">
        <button
          role="tab" aria-selected={view === "draw"}
          onClick={() => setView("draw")}
          className="view-btn"
          style={{ ...S.viewBtn, ...(view === "draw" ? S.viewBtnActive : {}) }}
        >🎋 抽籤模式</button>
        <button
          role="tab" aria-selected={view === "table"}
          onClick={() => setView("table")}
          className="view-btn"
          style={{ ...S.viewBtn, ...(view === "table" ? S.viewBtnActive : {}) }}
        >📋 表格模式</button>
      </div>

      {/* 熱量選擇（兩種模式共用） */}
      <section style={S.section}>
        <div style={S.sectionLabel}>每日熱量</div>
        <div style={S.calRow}>
          {[1600, 1800, 2000].map((cv) => (
            <button
              key={cv}
              onClick={() => changeCal(cv)}
              className="cal-btn"
              style={{ ...S.calBtn, ...(cal === cv ? S.calBtnActive : {}) }}
            >
              <span style={S.calNum}>{cv}</span>
              <span style={S.calUnit}>大卡</span>
            </button>
          ))}
        </div>
        <div style={S.servRow}>
          {Object.entries(SERVINGS[cal]).map(([k, v]) => (
            <span key={k} style={S.servChip}>
              <b style={{ fontWeight: 700 }}>{k}</b>&nbsp;{v}
            </span>
          ))}
        </div>
      </section>

      {view === "draw" ? (
        <>
          {/* 餐別選擇 */}
          <section style={S.section}>
            <div style={S.sectionLabel}>抽什麼</div>
            <div style={S.mealRow}>
              <button
                onClick={() => changeMode("day")}
                className="meal-btn"
                style={{ ...S.mealBtn, ...(activeMode === "day" ? S.mealBtnActive : {}) }}
              >一整天</button>
              {meals.map((m) => (
                <button
                  key={m}
                  onClick={() => changeMode(m)}
                  className="meal-btn"
                  style={{ ...S.mealBtn, ...(activeMode === m ? S.mealBtnActive : {}) }}
                >{m}</button>
              ))}
            </div>
            {activeMode === "day" && (
              <div style={S.dayStyleRow}>
                <button
                  onClick={() => changeDayStyle("set")}
                  className="meal-btn"
                  style={{ ...S.dayStyleBtn, ...(dayStyle === "set" ? S.dayStyleBtnActive : {}), ...(filterActive ? { opacity: 0.45 } : {}) }}
                >照組合抽</button>
                <button
                  onClick={() => changeDayStyle("mix")}
                  className="meal-btn"
                  style={{ ...S.dayStyleBtn, ...(dayStyle === "mix" ? S.dayStyleBtnActive : {}) }}
                >自由混搭</button>
                <span style={S.dayStyleHint}>
                  {filterActive
                    ? "已指定商家，一整天將以自由混搭抽出"
                    : dayStyle === "set"
                    ? `從 ${dayCombos.length} 個營養師配好的一日組合中抽一整欄`
                    : "各餐獨立抽，自由搭配"}
                </span>
              </div>
            )}
          </section>

          {/* 商家篩選 */}
          <section style={S.section}>
            <div style={S.sectionLabel}>
              指定商家
              <span style={S.sectionLabelNote}>（今天附近有什麼就點什麼，不點 = 不限）</span>
            </div>
            <div style={S.storeRow}>
              {storeStats.map(([name, count]) => {
                const on = pickedStores.includes(name);
                return (
                  <button
                    key={name}
                    onClick={() => toggleStore(name)}
                    className="meal-btn"
                    style={{ ...S.storeChip, ...(on ? S.storeChipActive : {}) }}
                  >
                    {name} <span style={{ opacity: 0.65, fontSize: 11 }}>{count}</span>
                  </button>
                );
              })}
            </div>
            {filterActive && (
              <div style={S.storeSummary}>
                <span>
                  可抽選項：{meals.map((m) => `${m} ${filteredPools[m].length}`).join("・")}
                  {meals.some((m) => filteredPools[m].length === 0) && "（0 的餐別抽不出來，建議多勾幾家）"}
                </span>
                <button onClick={clearStores} className="meal-btn" style={S.clearBtn}>清除</button>
              </div>
            )}
          </section>

          <div style={S.drawWrap}>
            <button onClick={doDraw} className={shaking ? "draw-btn shake" : "draw-btn"} style={S.drawBtn}>
              <span style={{ fontSize: 26, lineHeight: 1 }}>🎋</span>
              <span>{results ? "再抽一次" : "抽籤"}</span>
            </button>
            {drawCount > 0 && <div style={S.drawHint}>第 {drawCount} 抽</div>}
          </div>

          {shownMeals.length > 0 && setLabel && (
            <div style={S.setBadge}>🎋 {setLabel}　—　整組照抽，可對照表格模式</div>
          )}
          {shownMeals.length > 0 && (
            <section style={S.resultGrid} key={drawCount}>
              {shownMeals.map((m, i) => {
                const r = results[m];
                if (!r) {
                  return (
                    <article
                      key={m}
                      className={reduceMotion ? "" : "stick-in"}
                      style={{ ...S.stick, animationDelay: `${i * 90}ms`, opacity: 0.75 }}
                    >
                      <div style={{ ...S.stickTop, background: "#9A8468" }}>
                        <span style={S.stickIcon}>{MEAL_ICON[m]}</span>
                        <span style={S.stickMeal}>{m}籤</span>
                      </div>
                      <div style={{ ...S.stickStore, fontSize: 18, color: "#9A8468" }}>抽不出來</div>
                      <div style={{ fontSize: 13, color: "#8A7860", lineHeight: 1.7, flex: 1, paddingTop: 8 }}>
                        所選商家沒有{m}的選項，多勾幾家商家或清除篩選再抽
                      </div>
                    </article>
                  );
                }
                return (
                  <article
                    key={m}
                    className={reduceMotion ? "" : "stick-in"}
                    style={{ ...S.stick, animationDelay: `${i * 90}ms` }}
                  >
                    <div style={S.stickTop}>
                      <span style={S.stickIcon}>{MEAL_ICON[m]}</span>
                      <span style={S.stickMeal}>{m}籤</span>
                    </div>
                    <div style={S.stickStore}>{r.store || "點心組合"}</div>
                    <ul style={S.stickList}>
                      {r.items.map((it, j) => (
                        <li key={j} style={S.stickItem}>{it}</li>
                      ))}
                    </ul>
                    <button onClick={() => redrawMeal(m)} className="redraw-btn" style={S.redrawBtn}>
                      重抽這一籤
                    </button>
                  </article>
                );
              })}
            </section>
          )}

          {shownMeals.length > 0 && (
            <div style={S.exportWrap}>
              <button onClick={exportImage} className="export-btn" style={S.exportBtn}>
                🖼️ 輸出今日籤圖片
              </button>
            </div>
          )}

          {shownMeals.length === 0 && (
            <div style={S.empty}>
              <div style={{ fontSize: 44, marginBottom: 10 }}>🥢</div>
              選好熱量與餐別，按下「抽籤」<br />讓籤筒決定今天吃什麼
            </div>
          )}
        </>
      ) : (
        /* ---------- 表格模式：照原始海報排版 ---------- */
        <section style={S.tableWrap}>
          {/* 關鍵字搜尋 */}
          <div style={S.searchWrap}>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="搜尋店家或品項，例如：牛肉麵、7-11、茶碗蒸"
              style={S.searchInput}
              aria-label="搜尋菜單"
            />
            {q && (
              <div style={S.searchResult}>
                {searchHits.length === 0 ? (
                  <div style={S.searchEmpty}>三份菜單裡都沒有「{q}」，換個關鍵字試試</div>
                ) : (
                  <>
                    <div style={S.searchCount}>找到 {searchHits.length} 筆（點擊可跳到該熱量）</div>
                    <div style={S.hitList}>
                      {searchHits.map((h, i) => (
                        <button
                          key={i}
                          className="hit-row"
                          style={{ ...S.hitRow, ...(h.cal === cal ? S.hitRowCurrent : {}) }}
                          onClick={() => { if (h.cal !== cal) changeCal(h.cal); }}
                        >
                          <span style={S.hitLoc}>{h.cal}卡・第{h.bi + 1}組・組合{NUM_CN[h.ci]}・{h.meal}</span>
                          <span style={S.hitBody}>
                            {h.combo.store && <b style={{ color: VERMILION }}>{hl(h.combo.store)}</b>}
                            {h.combo.store ? "：" : ""}{hl(h.combo.items.join("、"))}
                          </span>
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* 餐別篩選 */}
          <div style={S.tableMealRow}>
            <button
              onClick={() => setTableMeals([])}
              className="meal-btn"
              style={{ ...S.mealBtn, ...(tableMeals.length === 0 ? S.mealBtnActive : {}) }}
            >全部</button>
            {meals.map((m) => (
              <button
                key={m}
                onClick={() => toggleTableMeal(m)}
                className="meal-btn"
                style={{ ...S.mealBtn, ...(tableMeals.includes(m) ? S.mealBtnActive : {}) }}
              >{MEAL_ICON[m]} {m}</button>
            ))}
          </div>

          <p style={S.tableHint}>
            依原始海報排列：{cal} 大卡共 3 組菜單表，每組有組合一～五。抽籤池即由下列所有格子組成。
          </p>
          {RAW[cal].map((block, bi) => (
            <div key={bi} style={S.blockCard}>
              <div style={S.blockTitle}>第 {bi + 1} 組菜單</div>
              <div style={S.tableScroll}>
                <table style={S.table}>
                  <thead>
                    <tr>
                      <th style={{ ...S.th, ...S.thMeal }}>餐別</th>
                      {["組合一", "組合二", "組合三", "組合四", "組合五"].map((h) => (
                        <th key={h} style={S.th}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {visibleTableMeals.map((m) => (
                      <tr key={m}>
                        <td style={S.tdMeal}>
                          <span style={{ marginRight: 4 }}>{MEAL_ICON[m]}</span>{m}
                        </td>
                        {(block[m] || []).map((combo, ci) => (
                          <td key={ci} style={{ ...S.td, ...(cellMatches(combo) ? S.tdHit : {}) }}>
                            {combo.store && <div style={S.cellStore}>{hl(combo.store)}</div>}
                            {combo.items.map((it, ii) => (
                              <div key={ii} style={S.cellItem}>{hl(it)}</div>
                            ))}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </section>
      )}

      {exportData && (
        <div style={S.modalOverlay} onClick={closeExport}>
          <div style={S.modalCard} onClick={(e) => e.stopPropagation()}>
            <div style={S.modalTitle}>今日籤已產生 🎋</div>
            <div style={S.modalHintTop}>手機可直接長按圖片儲存到相簿</div>
            <div style={S.modalImgWrap}>
              <img src={exportData.url} alt="今日食籤" style={S.modalImg} />
            </div>
            <div style={S.modalBtnRow}>
              <button onClick={shareExport} className="modal-btn-primary" style={S.modalBtnPrimary}>
                分享／存到相簿
              </button>
              <button onClick={downloadExport} className="modal-btn" style={S.modalBtn}>
                下載檔案
              </button>
              <button onClick={closeExport} className="modal-btn" style={S.modalBtn}>
                關閉
              </button>
            </div>
          </div>
        </div>
      )}

      <footer style={S.footer}>
        菜單由營養師規劃（1600／1800／2000 大卡減脂減醣配置）
      </footer>
    </div>
  );
}

/* ---------- 樣式 ---------- */

const INK = "#2B2320";
const VERMILION = "#C8402A";
const PAPER = "#FBF3E2";
const AMBER = "#E8A33D";
const JADE = "#4A7C59";

const S = {
  page: {
    minHeight: "100vh",
    background: `radial-gradient(circle at 15% 10%, #FFF9EC 0%, ${PAPER} 45%, #F6E7C9 100%)`,
    color: INK,
    fontFamily: `'Noto Sans TC', 'PingFang TC', 'Microsoft JhengHei', sans-serif`,
    padding: "40px 20px 60px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  header: { textAlign: "center", marginBottom: 26 },
  eyebrow: {
    display: "inline-block",
    fontSize: 12,
    letterSpacing: "0.35em",
    color: VERMILION,
    border: `1px solid ${VERMILION}`,
    borderRadius: 999,
    padding: "5px 16px 5px 20px",
    marginBottom: 16,
  },
  title: {
    fontFamily: `'Noto Serif TC', 'PingFang TC', serif`,
    fontSize: "clamp(44px, 8vw, 64px)",
    fontWeight: 900,
    letterSpacing: "0.12em",
    margin: 0,
    color: INK,
  },
  subtitle: { marginTop: 12, fontSize: 14, color: "#6E5F52", letterSpacing: "0.05em" },

  viewSwitch: {
    display: "flex",
    gap: 0,
    marginBottom: 26,
    border: `2px solid ${INK}`,
    borderRadius: 999,
    overflow: "hidden",
    background: "#FFFDF6",
  },
  viewBtn: {
    padding: "10px 26px",
    border: "none",
    background: "transparent",
    color: "#8A7860",
    fontSize: 15,
    fontWeight: 700,
    letterSpacing: "0.1em",
    cursor: "pointer",
    transition: "all .18s ease",
  },
  viewBtnActive: { background: INK, color: PAPER },

  section: { width: "100%", maxWidth: 640, marginBottom: 22 },
  sectionLabel: { fontSize: 12, letterSpacing: "0.3em", color: "#9A8468", marginBottom: 10, fontWeight: 700 },
  calRow: { display: "flex", gap: 10 },
  calBtn: {
    flex: 1, padding: "14px 8px", borderRadius: 14,
    border: `2px solid #E4D3B4`, background: "#FFFDF6", color: "#8A7860",
    cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
    transition: "all .18s ease",
  },
  calBtnActive: {
    border: `2px solid ${VERMILION}`, background: VERMILION, color: "#FFF6E9",
    boxShadow: "0 6px 18px rgba(200,64,42,.28)",
  },
  calNum: { fontFamily: `'Noto Serif TC', serif`, fontSize: 26, fontWeight: 900, lineHeight: 1 },
  calUnit: { fontSize: 12, letterSpacing: "0.2em" },
  servRow: { display: "flex", flexWrap: "wrap", gap: 6, marginTop: 12 },
  servChip: { fontSize: 12, background: "#F3E5C8", color: "#7A6547", borderRadius: 999, padding: "4px 12px" },

  mealRow: { display: "flex", flexWrap: "wrap", gap: 8 },
  mealBtn: {
    padding: "9px 18px", borderRadius: 999,
    border: `1.5px solid #E4D3B4`, background: "#FFFDF6", color: "#8A7860",
    fontSize: 14, cursor: "pointer", transition: "all .18s ease",
  },
  mealBtnActive: { border: `1.5px solid ${INK}`, background: INK, color: PAPER },

  dayStyleRow: { display: "flex", alignItems: "center", flexWrap: "wrap", gap: 8, marginTop: 12 },
  dayStyleBtn: {
    padding: "6px 14px", borderRadius: 999,
    border: `1.5px solid #D8C49C`, background: "#FFFDF6", color: "#8A7860",
    fontSize: 12.5, cursor: "pointer", transition: "all .18s ease", letterSpacing: "0.08em",
  },
  dayStyleBtnActive: { border: `1.5px solid ${JADE}`, background: JADE, color: "#FFFBF0" },
  dayStyleHint: { fontSize: 12, color: "#9A8468", letterSpacing: "0.04em" },
  sectionLabelNote: { fontWeight: 400, letterSpacing: "0.05em", marginLeft: 6, textTransform: "none" },
  storeRow: { display: "flex", flexWrap: "wrap", gap: 6 },
  storeChip: {
    padding: "7px 13px", borderRadius: 999,
    border: `1.5px solid #E4D3B4`, background: "#FFFDF6", color: "#8A7860",
    fontSize: 13, cursor: "pointer", transition: "all .18s ease",
  },
  storeChipActive: {
    border: `1.5px solid ${VERMILION}`, background: VERMILION, color: "#FFF6E9",
  },
  storeSummary: {
    marginTop: 10, display: "flex", alignItems: "center", justifyContent: "space-between",
    gap: 10, flexWrap: "wrap",
    fontSize: 12, color: "#7A6547", background: "#F3E5C8",
    borderRadius: 10, padding: "8px 12px", lineHeight: 1.6,
  },
  clearBtn: {
    padding: "4px 14px", borderRadius: 999,
    border: `1.5px solid ${INK}`, background: "transparent", color: INK,
    fontSize: 12, fontWeight: 700, cursor: "pointer", transition: "all .18s ease",
    flexShrink: 0,
  },

  setBadge: {
    marginBottom: 16,
    padding: "8px 20px",
    borderRadius: 999,
    background: "#F3E5C8",
    border: `1.5px dashed ${VERMILION}`,
    color: "#8A4A2A",
    fontSize: 13.5,
    fontWeight: 700,
    letterSpacing: "0.1em",
  },

  drawWrap: { margin: "14px 0 30px", textAlign: "center" },
  drawBtn: {
    display: "inline-flex", alignItems: "center", gap: 12,
    padding: "16px 46px", borderRadius: 999, border: "none",
    background: `linear-gradient(135deg, ${VERMILION}, #A93320)`,
    color: "#FFF6E9", fontSize: 20, fontWeight: 800, letterSpacing: "0.3em",
    cursor: "pointer", boxShadow: "0 10px 26px rgba(169,51,32,.35)",
    fontFamily: `'Noto Serif TC', serif`,
  },
  drawHint: { marginTop: 10, fontSize: 12, color: "#9A8468", letterSpacing: "0.2em" },

  resultGrid: { width: "100%", maxWidth: 980, display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 16 },
  stick: {
    width: 196, minHeight: 300, background: "#FFFBF0",
    border: `2px solid ${INK}`,
    borderRadius: "10px 10px 60px 60px / 10px 10px 26px 26px",
    boxShadow: "4px 6px 0 rgba(43,35,32,.16)",
    padding: "0 16px 18px",
    display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center",
  },
  stickTop: {
    alignSelf: "stretch", background: VERMILION, color: "#FFF6E9",
    margin: "0 -16px", borderRadius: "7px 7px 0 0", padding: "10px 8px",
    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
    letterSpacing: "0.35em", fontWeight: 800, fontSize: 15,
  },
  stickIcon: { fontSize: 16, letterSpacing: 0 },
  stickMeal: { fontFamily: `'Noto Serif TC', serif`, paddingLeft: 4 },
  stickStore: {
    fontFamily: `'Noto Serif TC', serif`, fontSize: 22, fontWeight: 900,
    margin: "16px 0 4px", color: INK, letterSpacing: "0.06em",
  },
  stickList: { listStyle: "none", padding: 0, margin: "10px 0 0", width: "100%", flex: 1 },
  stickItem: {
    fontSize: 13.5, lineHeight: 1.5, padding: "7px 0",
    borderBottom: "1px dashed #DECBA6", color: "#4C4238",
  },
  redrawBtn: {
    marginTop: 14, fontSize: 12, letterSpacing: "0.15em",
    padding: "7px 16px", borderRadius: 999,
    border: `1.5px solid ${JADE}`, background: "transparent", color: JADE,
    cursor: "pointer", transition: "all .18s ease",
  },
  empty: { marginTop: 8, textAlign: "center", color: "#9A8468", fontSize: 15, lineHeight: 1.9, letterSpacing: "0.08em" },

  exportWrap: { marginTop: 26, textAlign: "center" },
  modalOverlay: {
    position: "fixed", inset: 0, zIndex: 100,
    background: "rgba(43,35,32,.55)",
    display: "flex", alignItems: "center", justifyContent: "center",
    padding: 16,
  },
  modalCard: {
    background: "#FFFBF0",
    border: "2px solid #2B2320",
    borderRadius: 18,
    boxShadow: "6px 8px 0 rgba(43,35,32,.25)",
    padding: "18px 18px 16px",
    width: "100%", maxWidth: 420,
    maxHeight: "90vh",
    display: "flex", flexDirection: "column",
  },
  modalTitle: {
    fontFamily: `'Noto Serif TC', serif`,
    fontSize: 20, fontWeight: 900, color: "#2B2320",
    textAlign: "center", letterSpacing: "0.1em",
  },
  modalHintTop: { fontSize: 12, color: "#9A8468", textAlign: "center", margin: "6px 0 12px" },
  modalImgWrap: {
    overflowY: "auto", WebkitOverflowScrolling: "touch",
    border: "1px solid #E4D3B4", borderRadius: 10,
    background: "#F6E7C9", flex: 1, minHeight: 0,
  },
  modalImg: { display: "block", width: "100%", height: "auto" },
  modalBtnRow: { display: "flex", gap: 8, marginTop: 14, flexWrap: "wrap" },
  modalBtnPrimary: {
    flex: "1 1 100%",
    padding: "12px 16px", borderRadius: 999, border: "none",
    background: "linear-gradient(135deg, #C8402A, #A93320)",
    color: "#FFF6E9", fontSize: 15, fontWeight: 800, letterSpacing: "0.12em",
    cursor: "pointer",
    boxShadow: "0 6px 16px rgba(169,51,32,.3)",
  },
  modalBtn: {
    flex: 1,
    padding: "10px 12px", borderRadius: 999,
    border: "1.5px solid #2B2320", background: "transparent",
    color: "#2B2320", fontSize: 13, fontWeight: 700, letterSpacing: "0.08em",
    cursor: "pointer", transition: "all .18s ease",
  },
  exportBtn: {
    padding: "12px 30px", borderRadius: 999,
    border: `2px solid ${INK}`, background: "#FFFDF6", color: INK,
    fontSize: 15, fontWeight: 800, letterSpacing: "0.12em",
    cursor: "pointer", transition: "all .18s ease",
    boxShadow: "3px 4px 0 rgba(43,35,32,.16)",
  },

  /* 表格模式 */
  tableWrap: { width: "100%", maxWidth: 1080 },
  searchWrap: { marginBottom: 14 },
  tableMealRow: { display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 14 },
  searchInput: {
    width: "100%", boxSizing: "border-box",
    padding: "13px 18px", borderRadius: 999,
    border: `2px solid ${INK}`, background: "#FFFDF6",
    fontSize: 15, color: INK, outline: "none",
    fontFamily: `'Noto Sans TC', 'PingFang TC', sans-serif`,
    boxShadow: "3px 4px 0 rgba(43,35,32,.12)",
  },
  searchResult: { marginTop: 10 },
  searchCount: { fontSize: 12, color: "#9A8468", letterSpacing: "0.1em", marginBottom: 8 },
  searchEmpty: {
    fontSize: 13, color: "#8A7860", background: "#F3E5C8",
    borderRadius: 10, padding: "10px 14px",
  },
  hitList: { display: "flex", flexDirection: "column", gap: 6, maxHeight: 320, overflowY: "auto" },
  hitRow: {
    textAlign: "left", cursor: "pointer",
    background: "#FFFBF0", border: "1.5px solid #E4D3B4", borderRadius: 10,
    padding: "8px 12px", fontSize: 13, lineHeight: 1.6, color: "#4C4238",
    display: "flex", flexDirection: "column", gap: 2,
    transition: "all .15s ease",
    fontFamily: `'Noto Sans TC', 'PingFang TC', sans-serif`,
  },
  hitRowCurrent: { border: `1.5px solid ${VERMILION}` },
  hitLoc: { fontSize: 11.5, color: "#9A8468", letterSpacing: "0.08em", fontWeight: 700 },
  hitBody: {},
  mark: { background: "#FFD98A", color: "#5A3E12", borderRadius: 3, padding: "0 1px" },
  tdHit: { background: "#FFF0D2", boxShadow: `inset 0 0 0 2px ${AMBER}` },
  tableHint: { fontSize: 13, color: "#8A7860", margin: "0 0 16px", lineHeight: 1.7 },
  blockCard: {
    background: "#FFFBF0",
    border: `2px solid ${INK}`,
    borderRadius: 16,
    boxShadow: "4px 6px 0 rgba(43,35,32,.12)",
    marginBottom: 26,
    overflow: "hidden",
  },
  blockTitle: {
    background: INK, color: PAPER,
    fontFamily: `'Noto Serif TC', serif`,
    fontSize: 16, fontWeight: 800, letterSpacing: "0.25em",
    padding: "10px 18px",
  },
  tableScroll: { overflowX: "auto", WebkitOverflowScrolling: "touch" },
  table: { borderCollapse: "collapse", width: "100%", minWidth: 760 },
  th: {
    background: VERMILION, color: "#FFF6E9",
    fontSize: 13, fontWeight: 800, letterSpacing: "0.2em",
    padding: "8px 10px", border: "1px solid #E9D9B8", whiteSpace: "nowrap",
  },
  thMeal: { background: "#A93320", position: "sticky", left: 0, zIndex: 1 },
  tdMeal: {
    background: "#F3E5C8", color: "#7A5A34",
    fontWeight: 800, fontSize: 13, letterSpacing: "0.1em",
    padding: "10px 10px", border: "1px solid #E9D9B8",
    whiteSpace: "nowrap", verticalAlign: "top",
    position: "sticky", left: 0, zIndex: 1,
  },
  td: {
    border: "1px solid #E9D9B8", padding: "10px 10px",
    verticalAlign: "top", fontSize: 12.5, lineHeight: 1.55, color: "#4C4238",
    minWidth: 128,
  },
  cellStore: {
    fontWeight: 800, color: VERMILION, fontSize: 13, marginBottom: 4,
    fontFamily: `'Noto Serif TC', serif`,
  },
  cellItem: { padding: "1px 0" },

  footer: { marginTop: 46, fontSize: 12, color: "#A9977C", letterSpacing: "0.08em", textAlign: "center" },
};

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Noto+Serif+TC:wght@700;900&family=Noto+Sans+TC:wght@400;500;700&display=swap');

.cal-btn:hover { transform: translateY(-2px); }
.meal-btn:hover { border-color: ${INK}; color: ${INK}; }
.view-btn:hover { color: ${INK}; }
.draw-btn:hover { transform: translateY(-2px); box-shadow: 0 14px 30px rgba(169,51,32,.4); }
.draw-btn:active { transform: translateY(1px); }
.redraw-btn:hover { background: ${JADE}; color: #FFFBF0; }
.export-btn:hover { background: ${INK}; color: ${PAPER}; transform: translateY(-2px); }
.export-btn:active { transform: translateY(1px); }
.modal-btn:hover { background: ${INK}; color: ${PAPER}; }
.modal-btn-primary:hover { transform: translateY(-1px); box-shadow: 0 8px 20px rgba(169,51,32,.4); }
.hit-row:hover { border-color: ${INK}; transform: translateX(2px); }
button:focus-visible { outline: 3px solid ${AMBER}; outline-offset: 2px; }

@keyframes shake {
  0%,100% { transform: rotate(0deg); }
  20% { transform: rotate(-5deg) translateX(-3px); }
  40% { transform: rotate(5deg) translateX(3px); }
  60% { transform: rotate(-4deg); }
  80% { transform: rotate(4deg); }
}
.draw-btn.shake { animation: shake .55s ease; }

@keyframes stickIn {
  from { opacity: 0; transform: translateY(26px) rotate(-1.5deg); }
  to { opacity: 1; transform: translateY(0) rotate(0); }
}
.stick-in { animation: stickIn .45s cubic-bezier(.2,.9,.3,1.2) both; }

@media (prefers-reduced-motion: reduce) {
  .stick-in, .draw-btn.shake { animation: none !important; }
  .cal-btn:hover, .draw-btn:hover { transform: none; }
}
`;
