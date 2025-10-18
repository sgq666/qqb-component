const deptData = [
  {
    deptCode: "460105000000",
    deptName: "秀英分局",
  },
  {
    deptCode: "460106000000",
    deptName: "龙华分局",
  },
  {
    deptCode: "460107000000",
    deptName: "琼山分局",
  },
  {
    deptCode: "460108000000",
    deptName: "美兰分局",
  },
  {
    deptCode: "460109000000",
    deptName: "江东分局",
  },
  {
    deptCode: "460110000000",
    deptName: "美兰国际机场分局",
  },
  {
    deptCode: "460100000000",
    deptName: "海口市公安局",
  },
  {
    deptCode: "460000605100",
    deptName: "海口港港区派出所",
  },
  {
    deptCode: "460000605200",
    deptName: "海口港码头派出所",
  },
  {
    deptCode: "460000601700",
    deptName: "港航交警支队",
  },
  {
    deptCode: "460000605500",
    deptName: "马村港派出所",
  },
  {
    deptCode: "460000605400",
    deptName: "新海港派出所",
  },
  {
    deptCode: "460000614501",
    deptName: "海口美兰机场海关缉私分局办公室",
  },
  {
    deptCode: "460000614560",
    deptName: "海口美兰机场海关缉私分局法制科",
  },
  {
    deptCode: "460000614570",
    deptName: "海口美兰机场海关缉私分局缉私科",
  },
  {
    deptCode: "460100020000",
    deptName: "经侦支队",
  },
  {
    deptCode: "460100010000",
    deptName: "国保支队",
  },
  {
    deptCode: "460100060000",
    deptName: "出入境管理支队",
  },
  {
    deptCode: "460100080000",
    deptName: "留置陪护支队",
  },
  {
    deptCode: "460100100000",
    deptName: "情报中心",
  },
  {
    deptCode: "460100190000",
    deptName: "行政审批办公室",
  },
  {
    deptCode: "460100130000",
    deptName: "监管支队",
  },
  {
    deptCode: "460100180000",
    deptName: "法制支队",
  },
  {
    deptCode: "460100220000",
    deptName: "海南省公安厅海岸警察总队第一支队",
  },
  {
    deptCode: "460100200000",
    deptName: "警务保障处",
  },
  {
    deptCode: "460100210000",
    deptName: "禁毒支队",
  },
  {
    deptCode: "460100099000",
    deptName: "局领导",
  },
  {
    deptCode: "460100240000",
    deptName: "海南省公安厅海岸警察总队第一支队沿海管控与侦查大队",
  },
  {
    deptCode: "460100230000",
    deptName: "科技信息通信处",
  },
  {
    deptCode: "460100270000",
    deptName: "反恐处",
  },
  {
    deptCode: "460100290000",
    deptName: "户政处",
  },
  {
    deptCode: "460100310000",
    deptName: "办公室",
  },
  {
    deptCode: "460100320000",
    deptName: "纪委",
  },
  {
    deptCode: "460100340000",
    deptName: "警务督察支队",
  },
  {
    deptCode: "460100410000",
    deptName: "旅游警察支队",
  },
  {
    deptCode: "460100380000",
    deptName: "城警支队",
  },
  {
    deptCode: "460100480000",
    deptName: "旅游警察支队",
  },
  {
    deptCode: "460100490000",
    deptName: "刑技支队",
  },
  {
    deptCode: "460100350000",
    deptName: "政治部",
  },
  {
    deptCode: "460100370000",
    deptName: "教培处",
  },
  {
    deptCode: "460100360000",
    deptName: "警保处",
  },
  {
    deptCode: "800808000000",
    deptName: "广州市铁路公安局海口公安处",
  },
  {
    deptCode: "460100460000",
    deptName: "户政处",
  },
  {
    deptCode: "460100669432",
    deptName: "海口市中级人民检察院",
  },
  {
    deptCode: "460100669431",
    deptName: "海口市中级人民法院",
  },
  {
    deptCode: "460000614500",
    deptName: "海口美兰机场海关缉私分局（海南海口市）",
  },
  {
    deptCode: "460100280000",
    deptName: "城警支队",
  },
  {
    deptCode: "460100170000",
    deptName: "交警支队",
  },
  {
    deptCode: "460100110000",
    deptName: "网警支队",
  },
  {
    deptCode: "460100120000",
    deptName: "技侦支队",
  },
  {
    deptCode: "460100090000",
    deptName: "特警支队",
  },
  {
    deptCode: "460100050000",
    deptName: "刑警支队",
  },
  {
    deptCode: "460100030000",
    deptName: "治安支队",
  },
  {
    deptCode: "460112345678",
    deptName: "市反诈中心",
  },
  {
    deptCode: "460100280999",
    deptName: "无归属用户",
  },
  {
    deptCode: "460000600000",
    deptName: "港航公安局",
  },
  {
    deptCode: "460109660000",
    deptName: "开发区合成作战中心",
  },
  {
    deptCode: "460100600000",
    deptName: "森林分局",
  },
  {
    deptCode: "666666666666",
    deptName: "三亚指挥室",
  },
  {
    deptCode: "460100666000",
    deptName: "森林分局合成作战中心",
  },
  {
    deptCode: "460110660000",
    deptName: "机场分局合成作战中心",
  },
  {
    deptCode: "460107660000",
    deptName: "琼山合成作战中心",
  },
  {
    deptCode: "460105660000",
    deptName: "秀英合成作战中心",
  },
  {
    deptCode: "460108660000",
    deptName: "美兰合成作战中心",
  },
  {
    deptCode: "460106660000",
    deptName: "龙华合成作战中心",
  },
  {
    deptCode: "460100040000",
    deptName: "指挥中心",
  },
  {
    deptCode: "460100010400",
    deptName: "国保支队指挥室",
  },
  {
    deptCode: "460100010700",
    deptName: "国保支队三大队",
  },
  {
    deptCode: "460100010500",
    deptName: "国保支队一大队",
  },
  {
    deptCode: "460100014300",
    deptName: "国保支队政工纪检科",
  },
  {
    deptCode: "460100010800",
    deptName: "国保支队四大队",
  },
  {
    deptCode: "460100010900",
    deptName: "国保支队五大队",
  },
  {
    deptCode: "460100010600",
    deptName: "国保支队二大队",
  },
  {
    deptCode: "460100010801",
    deptName: "国保支队四大队侦察中队",
  },
  {
    deptCode: "460100010802",
    deptName: "国保支队四大队技术中队",
  },
  {
    deptCode: "460100020400",
    deptName: "经侦支队政工纪检科",
  },
  {
    deptCode: "460100020500",
    deptName: "经侦支队指挥室",
  },
  {
    deptCode: "460100020300",
    deptName: "经侦支队三大队",
  },
  {
    deptCode: "460100020200",
    deptName: "经侦支队二大队",
  },
  {
    deptCode: "460100020600",
    deptName: "经侦支队四大队",
  },
  {
    deptCode: "460100020700",
    deptName: "经侦支队五大队",
  },
  {
    deptCode: "460100020100",
    deptName: "经侦支队一大队",
  },
  {
    deptCode: "460100030100",
    deptName: "治安支队政工纪检科",
  },
  {
    deptCode: "460100030800",
    deptName: "治安支队六大队",
  },
  {
    deptCode: "460100030200",
    deptName: "治安支队指挥室",
  },
  {
    deptCode: "460100030500",
    deptName: "治安支队三大队",
  },
  {
    deptCode: "460100030300",
    deptName: "治安支队一大队",
  },
  {
    deptCode: "460100030400",
    deptName: "治安支队二大队",
  },
  {
    deptCode: "460100030600",
    deptName: "治安支队四大队",
  },
  {
    deptCode: "460100030700",
    deptName: "治安支队五大队",
  },
  {
    deptCode: "460100030900",
    deptName: "治安支队七大队",
  },
  {
    deptCode: "460100031000",
    deptName: "治安支队八大队",
  },
  {
    deptCode: "460100050800",
    deptName: "刑警支队阵控大队",
  },
  {
    deptCode: "460100050900",
    deptName: "刑警支队技术大队",
  },
  {
    deptCode: "460100050300",
    deptName: "刑警支队三大队",
  },
  {
    deptCode: "460100050200",
    deptName: "刑警支队二大队",
  },
  {
    deptCode: "460100050100",
    deptName: "刑警支队一大队",
  },
  {
    deptCode: "460100050600",
    deptName: "刑警支队六大队",
  },
  {
    deptCode: "460100050400",
    deptName: "刑警支队四大队",
  },
  {
    deptCode: "460100050500",
    deptName: "刑警支队五大队",
  },
  {
    deptCode: "460100050700",
    deptName: "刑警支队七大队",
  },
  {
    deptCode: "460100051200",
    deptName: "刑警支队情报大队",
  },
  {
    deptCode: "460100051100",
    deptName: "刑警支队政治处",
  },
  {
    deptCode: "460100051300",
    deptName: "刑警支队八大队",
  },
  {
    deptCode: "460100051000",
    deptName: "刑警支队指挥室",
  },
  {
    deptCode: "460100050701",
    deptName: "刑警支队七大队一中队",
  },
  {
    deptCode: "460100050703",
    deptName: "刑警支队七大队三中队",
  },
  {
    deptCode: "460100050702",
    deptName: "刑警支队七大队二中队",
  },
  {
    deptCode: "460100050902",
    deptName: "刑警支队技术大队照相录像中队",
  },
  {
    deptCode: "460100050903",
    deptName: "刑警支队技术大队痕迹检验中队",
  },
  {
    deptCode: "460100050901",
    deptName: "刑警支队技术大队法医物化中队",
  },
  {
    deptCode: "460100050907",
    deptName: "刑警支队技术大队电镜室",
  },
  {
    deptCode: "460100050906",
    deptName: "刑警支队技术大队文检室",
  },
  {
    deptCode: "460100050904",
    deptName: "刑警支队技术大队毒化室",
  },
  {
    deptCode: "460100050905",
    deptName: "刑警支队技术大队DNA室",
  },
  {
    deptCode: "460100060200",
    deptName: "出入境管理支队签证科",
  },
  {
    deptCode: "460100060500",
    deptName: "出入境管理支队三大队",
  },
  {
    deptCode: "460100060300",
    deptName: "出入境管理支队一大队",
  },
  {
    deptCode: "460100060400",
    deptName: "出入境管理支队二大队",
  },
  {
    deptCode: "460100060100",
    deptName: "出入境管理支队综合科",
  },
  {
    deptCode: "460100090700",
    deptName: "特警支队后勤保障处",
  },
  {
    deptCode: "460100090600",
    deptName: "特警支队作战训练处",
  },
  {
    deptCode: "460100090500",
    deptName: "特警支队政治处",
  },
  {
    deptCode: "460100095100",
    deptName: "特警支队一大队",
  },
  {
    deptCode: "460100095300",
    deptName: "特警支队三大队",
  },
  {
    deptCode: "460100095200",
    deptName: "特警支队二大队",
  },
  {
    deptCode: "460100095400",
    deptName: "特警支队四大队",
  },
  {
    deptCode: "460100095600",
    deptName: "特警支队六大队",
  },
  {
    deptCode: "460100095500",
    deptName: "特警支队五大队",
  },
  {
    deptCode: "460100095700",
    deptName: "特警支队七大队",
  },
  {
    deptCode: "460100095103",
    deptName: "特警支队一大队三中队",
  },
  {
    deptCode: "460100095102",
    deptName: "特警支队一大队二中队",
  },
  {
    deptCode: "460100095101",
    deptName: "特警支队一大队一中队",
  },
  {
    deptCode: "460100095104",
    deptName: "特警支队一大队四中队",
  },
  {
    deptCode: "460100095203",
    deptName: "特警支队二大队三中队",
  },
  {
    deptCode: "460100095201",
    deptName: "特警支队二大队一中队",
  },
  {
    deptCode: "460100095204",
    deptName: "特警支队二大队四中队",
  },
  {
    deptCode: "460100095202",
    deptName: "特警支队二大队二中队",
  },
  {
    deptCode: "460100095303",
    deptName: "特警支队三大队三中队",
  },
  {
    deptCode: "460100095301",
    deptName: "特警支队三大队一中队",
  },
  {
    deptCode: "460100095302",
    deptName: "特警支队三大队二中队",
  },
  {
    deptCode: "460100095304",
    deptName: "特警支队三大队四中队",
  },
  {
    deptCode: "460100095403",
    deptName: "特警支队四大队三中队",
  },
  {
    deptCode: "460100095401",
    deptName: "特警支队四大队一中队",
  },
  {
    deptCode: "460100095402",
    deptName: "特警支队四大队二中队",
  },
  {
    deptCode: "460100095404",
    deptName: "特警支队四大队四中队",
  },
  {
    deptCode: "460100095503",
    deptName: "特警支队五大队三中队",
  },
  {
    deptCode: "460100095501",
    deptName: "特警支队五大队一中队",
  },
  {
    deptCode: "460100095502",
    deptName: "特警支队五大队二中队",
  },
  {
    deptCode: "460100095603",
    deptName: "特警支队六大队三中队",
  },
  {
    deptCode: "460100095601",
    deptName: "特警支队六大队一中队",
  },
  {
    deptCode: "460100095602",
    deptName: "特警支队六大队二中队",
  },
  {
    deptCode: "460100110400",
    deptName: "网警支队三大队",
  },
  {
    deptCode: "460100110200",
    deptName: "网警支队一大队",
  },
  {
    deptCode: "460100110300",
    deptName: "网警支队二大队",
  },
  {
    deptCode: "460100110100",
    deptName: "网警支队综合科",
  },
  {
    deptCode: "460100120200",
    deptName: "技侦支队办公室",
  },
  {
    deptCode: "460100120100",
    deptName: "技侦支队政工科",
  },
  {
    deptCode: "460100121100",
    deptName: "技侦支队九大队",
  },
  {
    deptCode: "460100120500",
    deptName: "技侦支队三大队",
  },
  {
    deptCode: "460100121000",
    deptName: "技侦支队八大队",
  },
  {
    deptCode: "460100120800",
    deptName: "技侦支队六大队",
  },
  {
    deptCode: "460100120300",
    deptName: "技侦支队一大队",
  },
  {
    deptCode: "460100120400",
    deptName: "技侦支队二大队",
  },
  {
    deptCode: "460100120600",
    deptName: "技侦支队四大队",
  },
  {
    deptCode: "460100120900",
    deptName: "技侦支队七大队",
  },
  {
    deptCode: "460100120700",
    deptName: "技侦支队五大队",
  },
  {
    deptCode: "460100130800",
    deptName: "海口市公安监所管理医院",
  },
  {
    deptCode: "460100130200",
    deptName: "监管支队业务指导科",
  },
  {
    deptCode: "460100130300",
    deptName: "海口市第一看守所",
  },
  {
    deptCode: "460100130900",
    deptName: "监管支队公安监所管理医院",
  },
  {
    deptCode: "460100130400",
    deptName: "海口市第二看守所",
  },
  {
    deptCode: "460100130600",
    deptName: "强制隔离戒毒所",
  },
  {
    deptCode: "460100130100",
    deptName: "监管支队综合科",
  },
  {
    deptCode: "460100130500",
    deptName: "海口市拘留所",
  },
  {
    deptCode: "460100130700",
    deptName: "收容教育所",
  },
  {
    deptCode: "460100170800",
    deptName: "交警支队交通事故处理大队",
  },
  {
    deptCode: "460100170300",
    deptName: "交警支队指挥监控中心",
  },
  {
    deptCode: "460100171100",
    deptName: "交警支队交通违法处理大队",
  },
  {
    deptCode: "460100171200",
    deptName: "交警支队道路设施管理大队",
  },
  {
    deptCode: "460100171000",
    deptName: "交警支队第二车辆管理所",
  },
  {
    deptCode: "460100170900",
    deptName: "交警支队第一车辆管理所",
  },
  {
    deptCode: "460100170200",
    deptName: "交警支队纪检监察室",
  },
  {
    deptCode: "460100170500",
    deptName: "交警支队法制宣传科",
  },
  {
    deptCode: "460100170400",
    deptName: "交警支队办公室",
  },
  {
    deptCode: "460100170100",
    deptName: "交警支队政治处",
  },
  {
    deptCode: "460100170600",
    deptName: "交警支队秩序科",
  },
  {
    deptCode: "460100171300",
    deptName: "交警支队美兰大队",
  },
  {
    deptCode: "460100171400",
    deptName: "交警支队龙华大队",
  },
  {
    deptCode: "460100171500",
    deptName: "交警支队琼山大队",
  },
  {
    deptCode: "460100170700",
    deptName: "交警支队科技科",
  },
  {
    deptCode: "460100171800",
    deptName: "交警支队高速公路大队",
  },
  {
    deptCode: "460100171600",
    deptName: "交警支队秀英大队",
  },
  {
    deptCode: "460100172000",
    deptName: "交警支队快速路管理队",
  },
  {
    deptCode: "460100171900",
    deptName: "交警支队泊车管理科",
  },
  {
    deptCode: "460100171700",
    deptName: "交警支队特勤大队",
  },
  {
    deptCode: "460100171306",
    deptName: "交警支队美兰大队六中队",
  },
  {
    deptCode: "460100171303",
    deptName: "交警支队美兰大队三中队",
  },
  {
    deptCode: "460100171301",
    deptName: "交警支队美兰大队一中队",
  },
  {
    deptCode: "460100171308",
    deptName: "交警支队美兰大队八中队",
  },
  {
    deptCode: "460100171304",
    deptName: "交警支队美兰大队四中队",
  },
  {
    deptCode: "460100171305",
    deptName: "交警支队美兰大队五中队",
  },
  {
    deptCode: "460100171307",
    deptName: "交警支队美兰大队七中队",
  },
  {
    deptCode: "460100171302",
    deptName: "交警支队美兰大队二中队",
  },
  {
    deptCode: "460100171406",
    deptName: "交警支队龙华大队六中队",
  },
  {
    deptCode: "460100171401",
    deptName: "交警支队龙华大队一中队",
  },
  {
    deptCode: "460100171407",
    deptName: "交警支队龙华大队七中队",
  },
  {
    deptCode: "460100171403",
    deptName: "交警支队龙华大队三中队",
  },
  {
    deptCode: "460100171404",
    deptName: "交警支队龙华大队四中队",
  },
  {
    deptCode: "460100171402",
    deptName: "交警支队龙华大队二中队",
  },
  {
    deptCode: "460100171405",
    deptName: "交警支队龙华大队五中队",
  },
  {
    deptCode: "460100171408",
    deptName: "交警支队龙华大队八中队",
  },
  {
    deptCode: "460100171503",
    deptName: "交警支队琼山大队三中队",
  },
  {
    deptCode: "460100171506",
    deptName: "交警支队琼山大队六中队",
  },
  {
    deptCode: "460100171509",
    deptName: "交警支队琼山大队九中队",
  },
  {
    deptCode: "460100171501",
    deptName: "交警支队琼山大队一中队",
  },
  {
    deptCode: "460100171502",
    deptName: "交警支队琼山大队二中队",
  },
  {
    deptCode: "460100171504",
    deptName: "交警支队琼山大队四中队",
  },
  {
    deptCode: "460100171505",
    deptName: "交警支队琼山大队五中队",
  },
  {
    deptCode: "460100171603",
    deptName: "交警支队秀英大队三中队",
  },
  {
    deptCode: "460100171606",
    deptName: "交警支队秀英大队六中队",
  },
  {
    deptCode: "460100171601",
    deptName: "交警支队秀英大队一中队",
  },
  {
    deptCode: "460100171602",
    deptName: "交警支队秀英大队二中队",
  },
  {
    deptCode: "460100171604",
    deptName: "交警支队秀英大队四中队",
  },
  {
    deptCode: "460100171605",
    deptName: "交警支队秀英大队五中队",
  },
  {
    deptCode: "460100171701",
    deptName: "交警支队特勤大队一中队",
  },
  {
    deptCode: "460100171702",
    deptName: "交警支队特勤大队二中队",
  },
  {
    deptCode: "460100171803",
    deptName: "交警支队高速公路大队三中队",
  },
  {
    deptCode: "460100171809",
    deptName: "交警支队高速公路大队九中队",
  },
  {
    deptCode: "460100171806",
    deptName: "交警支队高速公路大队六中队",
  },
  {
    deptCode: "460100171808",
    deptName: "交警支队高速公路大队八中队",
  },
  {
    deptCode: "460100171801",
    deptName: "交警支队高速公路大队一中队",
  },
  {
    deptCode: "460100171802",
    deptName: "交警支队高速公路大队二中队",
  },
  {
    deptCode: "460100171804",
    deptName: "交警支队高速公路大队四中队",
  },
  {
    deptCode: "460100171805",
    deptName: "交警支队高速公路大队五中队",
  },
  {
    deptCode: "460100171807",
    deptName: "交警支队高速公路大队七中队",
  },
  {
    deptCode: "460100180400",
    deptName: "法制支队信访办",
  },
  {
    deptCode: "460100180300",
    deptName: "法制支队二大队",
  },
  {
    deptCode: "460100180200",
    deptName: "法制支队一大队",
  },
  {
    deptCode: "460100180100",
    deptName: "法制支队综合科",
  },
  {
    deptCode: "460100210300",
    deptName: "禁毒支队禁毒宣传科",
  },
  {
    deptCode: "460100210100",
    deptName: "禁毒支队政工纪检科",
  },
  {
    deptCode: "460100210200",
    deptName: "禁毒支队指挥室",
  },
  {
    deptCode: "460100210600",
    deptName: "禁毒支队三大队",
  },
  {
    deptCode: "460100210400",
    deptName: "禁毒支队一大队",
  },
  {
    deptCode: "460100210500",
    deptName: "禁毒支队二大队",
  },
  {
    deptCode: "460100220100",
    deptName: "海口市公安边防支队情报法制科",
  },
  {
    deptCode: "460100240200",
    deptName: "海南省公安厅海岸警察总队第一支队刑事侦查队",
  },
  {
    deptCode: "460100240100",
    deptName: "海南省公安厅海岸警察总队第一支队法制处",
  },
  {
    deptCode: "460100240201",
    deptName: "海南省公安厅海岸警察总队第一支队刑事侦查队专案组",
  },
  {
    deptCode: "460100270200",
    deptName: "反恐怖支队一大队",
  },
  {
    deptCode: "460100270300",
    deptName: "反恐怖支队二大队",
  },
  {
    deptCode: "460100270100",
    deptName: "反恐怖支队综合科",
  },
  {
    deptCode: "460100280200",
    deptName: "城警支队案件侦查大队",
  },
  {
    deptCode: "460100280300",
    deptName: "城警支队业务指导大队",
  },
  {
    deptCode: "460100280800",
    deptName: "城警支队琼山大队",
  },
  {
    deptCode: "460100280500",
    deptName: "城警支队秀英大队",
  },
  {
    deptCode: "460100280700",
    deptName: "城警支队龙华大队",
  },
  {
    deptCode: "460100280400",
    deptName: "城警支队机动大队",
  },
  {
    deptCode: "460100280600",
    deptName: "城警支队美兰大队",
  },
  {
    deptCode: "460100280100",
    deptName: "城警支队综合科",
  },
  {
    deptCode: "460100320400",
    deptName: "纪委警务督察队",
  },
  {
    deptCode: "460100320500",
    deptName: "纪委综合室",
  },
  {
    deptCode: "460100320300",
    deptName: "纪委三室",
  },
  {
    deptCode: "460100320200",
    deptName: "纪委二室",
  },
  {
    deptCode: "460100320100",
    deptName: "纪委一室",
  },
  {
    deptCode: "460100340200",
    deptName: "警务督察支队维权办",
  },
  {
    deptCode: "460100340300",
    deptName: "警务督察支队一大队",
  },
  {
    deptCode: "460100340400",
    deptName: "警务督察支队二大队",
  },
  {
    deptCode: "460100340100",
    deptName: "警务督察支队综合科",
  },
  {
    deptCode: "460100350400",
    deptName: "政治部老干部管理科",
  },
  {
    deptCode: "460100350300",
    deptName: "政治部宣传教育科",
  },
  {
    deptCode: "460100350200",
    deptName: "政治部组织人事科",
  },
  {
    deptCode: "460100350100",
    deptName: "政治部警务科",
  },
  {
    deptCode: "460100370200",
    deptName: "综合科",
  },
  {
    deptCode: "460100370100",
    deptName: "教务科",
  },
  {
    deptCode: "460100410200",
    deptName: "旅游警察支队二大队",
  },
  {
    deptCode: "460100410100",
    deptName: "旅游警察支队一大队",
  },
  {
    deptCode: "460100480200",
    deptName: "旅游警察支队二大队",
  },
  {
    deptCode: "460100480100",
    deptName: "旅游警察支队一大队",
  },
  {
    deptCode: "460100490400",
    deptName: "刑技支队三大队",
  },
  {
    deptCode: "460100490300",
    deptName: "刑技支队二大队",
  },
  {
    deptCode: "460100490500",
    deptName: "刑技支队四大队",
  },
  {
    deptCode: "460100490200",
    deptName: "刑技支队一大队",
  },
  {
    deptCode: "460100490100",
    deptName: "刑技支队综合科",
  },
  {
    deptCode: "460100605500",
    deptName: "新民林区派出所",
  },
  {
    deptCode: "460100603000",
    deptName: "森林指挥室",
  },
  {
    deptCode: "460100605700",
    deptName: "东寨港自然保护区派出所",
  },
  {
    deptCode: "460100605600",
    deptName: "火山口林区派出所",
  },
  {
    deptCode: "460100605400",
    deptName: "新海林区派出所",
  },
  {
    deptCode: "460100600600",
    deptName: "刑事侦查大队",
  },
  {
    deptCode: "460100601900",
    deptName: "法制督察大队",
  },
  {
    deptCode: "460100600400",
    deptName: "治安管理大队",
  },
  {
    deptCode: "460100605100",
    deptName: "园林派出所",
  },
  {
    deptCode: "460100600100",
    deptName: "局领导",
  },
  {
    deptCode: "460105010000",
    deptName: "国内安全保卫大队",
  },
  {
    deptCode: "460105030000",
    deptName: "治安警察大队",
  },
  {
    deptCode: "460105470000",
    deptName: "边防总队海口市边防支队秀英区大队",
  },
  {
    deptCode: "460105160000",
    deptName: "强制隔离戒毒所",
  },
  {
    deptCode: "460105060000",
    deptName: "刑事技术大队",
  },
  {
    deptCode: "460105410000",
    deptName: "巡逻防控大队",
  },
  {
    deptCode: "460105050000",
    deptName: "刑警大队",
  },
  {
    deptCode: "460105020000",
    deptName: "经侦大队",
  },
  {
    deptCode: "460105210000",
    deptName: "禁毒大队",
  },
  {
    deptCode: "460105520000",
    deptName: "海秀西路派出所",
  },
  {
    deptCode: "460105600000",
    deptName: "五源河派出所",
  },
  {
    deptCode: "460105560000",
    deptName: "永兴派出所",
  },
  {
    deptCode: "460105580000",
    deptName: "东山派出所",
  },
  {
    deptCode: "460105320000",
    deptName: "纪检监察室",
  },
  {
    deptCode: "460105460000",
    deptName: "办证中心",
  },
  {
    deptCode: "460105350000",
    deptName: "政治处",
  },
  {
    deptCode: "460105099000",
    deptName: "局领导",
  },
  {
    deptCode: "460105700000",
    deptName: "便衣大队",
  },
  {
    deptCode: "460105040000",
    deptName: "秀英指挥室",
  },
  {
    deptCode: "460105669432",
    deptName: "海口市秀英区人民检察院",
  },
  {
    deptCode: "460105669431",
    deptName: "海口市秀英区人民法院",
  },
  {
    deptCode: "460105540000",
    deptName: "长流派出所",
  },
  {
    deptCode: "460105570000",
    deptName: "石山派出所",
  },
  {
    deptCode: "460105510000",
    deptName: "秀英派出所",
  },
  {
    deptCode: "460105530000",
    deptName: "海秀派出所",
  },
  {
    deptCode: "460106056900",
    deptName: "刑警大队四中队",
  },
  {
    deptCode: "460105710000",
    deptName: "西海岸海岸派出所",
  },
  {
    deptCode: "460105730000",
    deptName: "新海海岸派出所",
  },
  {
    deptCode: "460105720000",
    deptName: "博南海岸派出所",
  },
  {
    deptCode: "460105550000",
    deptName: "西秀派出所",
  },
  {
    deptCode: "460105180000",
    deptName: "法制科",
  },
  {
    deptCode: "460105056200",
    deptName: "刑警大队阵控中队",
  },
  {
    deptCode: "460105056400",
    deptName: "刑警大队东片中队",
  },
  {
    deptCode: "460105056100",
    deptName: "刑警大队重案中队",
  },
  {
    deptCode: "460105056600",
    deptName: "刑警大队南片中队",
  },
  {
    deptCode: "460105056500",
    deptName: "刑警大队西片中队",
  },
  {
    deptCode: "460105056300",
    deptName: "刑警大队技术中队",
  },
  {
    deptCode: "460105056700",
    deptName: "便衣中队",
  },
  {
    deptCode: "460105416400",
    deptName: "巡逻防控大队治安检查站",
  },
  {
    deptCode: "460105416300",
    deptName: "巡逻防控大队三中队",
  },
  {
    deptCode: "460105416100",
    deptName: "巡逻防控大队一中队",
  },
  {
    deptCode: "460105416200",
    deptName: "巡逻防控大队二中队",
  },
  {
    deptCode: "460106010000",
    deptName: "国内安全保卫大队",
  },
  {
    deptCode: "460106030000",
    deptName: "治安警察大队",
  },
  {
    deptCode: "460106020000",
    deptName: "经侦大队",
  },
  {
    deptCode: "460106050000",
    deptName: "刑警大队",
  },
  {
    deptCode: "460106160000",
    deptName: "强制隔离戒毒所",
  },
  {
    deptCode: "460106360000",
    deptName: "强制隔离戒毒所",
  },
  {
    deptCode: "460106410000",
    deptName: "巡逻防控大队",
  },
  {
    deptCode: "460106210000",
    deptName: "禁毒大队",
  },
  {
    deptCode: "460106099000",
    deptName: "局领导",
  },
  {
    deptCode: "460106470000",
    deptName: "边防总队海口市边防支队龙华大队",
  },
  {
    deptCode: "460106540000",
    deptName: "中山派出所",
  },
  {
    deptCode: "460106320000",
    deptName: "纪检监察室",
  },
  {
    deptCode: "460106530000",
    deptName: "城西派出所",
  },
  {
    deptCode: "460106510000",
    deptName: "大同派出所",
  },
  {
    deptCode: "460106570000",
    deptName: "海垦派出所",
  },
  {
    deptCode: "460106520000",
    deptName: "金贸派出所",
  },
  {
    deptCode: "460106180000",
    deptName: "法制科",
  },
  {
    deptCode: "460106700000",
    deptName: "便衣大队",
  },
  {
    deptCode: "460106669431",
    deptName: "海口市龙华区人民法院",
  },
  {
    deptCode: "460106740000",
    deptName: "水上海岸派出所",
  },
  {
    deptCode: "460106710000",
    deptName: "长堤海岸派出所",
  },
  {
    deptCode: "460106630000",
    deptName: "观澜湖工作站",
  },
  {
    deptCode: "460106560000",
    deptName: "金宇派出所",
  },
  {
    deptCode: "460106550000",
    deptName: "滨海派出所",
  },
  {
    deptCode: "460106460000",
    deptName: "办证中心",
  },
  {
    deptCode: "460106350000",
    deptName: "政治处",
  },
  {
    deptCode: "460106060000",
    deptName: "刑事技术大队",
  },
  {
    deptCode: "460106720000",
    deptName: "万绿园海岸派出所",
  },
  {
    deptCode: "460106669432",
    deptName: "海口市龙华区人民检察院",
  },
  {
    deptCode: "460106040000",
    deptName: "龙华指挥室",
  },
  {
    deptCode: "460106580000",
    deptName: "龙泉派出所",
  },
  {
    deptCode: "460106590000",
    deptName: "龙桥派出所",
  },
  {
    deptCode: "460106610000",
    deptName: "新坡派出所",
  },
  {
    deptCode: "460106600000",
    deptName: "遵谭派出所",
  },
  {
    deptCode: "460106030100",
    deptName: "治安警察大队一中队",
  },
  {
    deptCode: "460106030200",
    deptName: "治安警察大队二中队",
  },
  {
    deptCode: "460106056300",
    deptName: "刑警大队情报中队",
  },
  {
    deptCode: "460106056100",
    deptName: "刑警大队重案中队",
  },
  {
    deptCode: "460106056400",
    deptName: "刑警大队预审中队",
  },
  {
    deptCode: "460106056800",
    deptName: "刑警大队便衣中队",
  },
  {
    deptCode: "460106056200",
    deptName: "刑警大队技术中队",
  },
  {
    deptCode: "460106056700",
    deptName: "刑警大队三中队",
  },
  {
    deptCode: "460106056600",
    deptName: "刑警大队二中队",
  },
  {
    deptCode: "460106056500",
    deptName: "刑警大队一中队",
  },
  {
    deptCode: "460106416500",
    deptName: "巡逻防控大队治安检查站",
  },
  {
    deptCode: "460106416300",
    deptName: "巡逻防控大队三中队",
  },
  {
    deptCode: "460106416400",
    deptName: "巡逻防控大队四中队",
  },
  {
    deptCode: "460106416100",
    deptName: "巡逻防控大队一中队",
  },
  {
    deptCode: "460106416200",
    deptName: "巡逻防控大队二中队",
  },
  {
    deptCode: "460107010000",
    deptName: "国内安全保卫大队",
  },
  {
    deptCode: "460107030000",
    deptName: "治安警察大队",
  },
  {
    deptCode: "460107050000",
    deptName: "刑警大队",
  },
  {
    deptCode: "460107240000",
    deptName: "强制隔离戒毒所",
  },
  {
    deptCode: "460107160000",
    deptName: "强制隔离戒毒所",
  },
  {
    deptCode: "460107020000",
    deptName: "经侦大队",
  },
  {
    deptCode: "460107460000",
    deptName: "琼山分局办证中心",
  },
  {
    deptCode: "460107060000",
    deptName: "刑事技术大队",
  },
  {
    deptCode: "460107410000",
    deptName: "巡逻防控大队",
  },
  {
    deptCode: "460107320000",
    deptName: "纪检监察室",
  },
  {
    deptCode: "460107210000",
    deptName: "禁毒大队",
  },
  {
    deptCode: "460107350000",
    deptName: "政治处",
  },
  {
    deptCode: "460107099000",
    deptName: "局领导",
  },
  {
    deptCode: "460107540000",
    deptName: "凤翔派出所",
  },
  {
    deptCode: "460107560000",
    deptName: "龙昆南派出所",
  },
  {
    deptCode: "460107600000",
    deptName: "三门坡派出所",
  },
  {
    deptCode: "460107510000",
    deptName: "滨江派出所",
  },
  {
    deptCode: "460107520000",
    deptName: "忠介派出所",
  },
  {
    deptCode: "460107570000",
    deptName: "龙塘派出所",
  },
  {
    deptCode: "460107530000",
    deptName: "国兴派出所",
  },
  {
    deptCode: "460107180000",
    deptName: "法制科",
  },
  {
    deptCode: "460107920000",
    deptName: "东昌派出所",
  },
  {
    deptCode: "460107040000",
    deptName: "琼山指挥室",
  },
  {
    deptCode: "460107620000",
    deptName: "旧州派出所",
  },
  {
    deptCode: "460107590000",
    deptName: "红旗派出所",
  },
  {
    deptCode: "460107610000",
    deptName: "大坡派出所",
  },
  {
    deptCode: "460107580000",
    deptName: "云龙派出所",
  },
  {
    deptCode: "460107550000",
    deptName: "云露派出所",
  },
  {
    deptCode: "460107470000",
    deptName: "便衣大队",
  },
  {
    deptCode: "460107640000",
    deptName: "新民派出所",
  },
  {
    deptCode: "460107650000",
    deptName: "谭文派出所",
  },
  {
    deptCode: "460107630000",
    deptName: "甲子派出所",
  },
  {
    deptCode: "460107910000",
    deptName: "红明派出所",
  },
  {
    deptCode: "460107669432",
    deptName: "海口市琼山区人民检察院",
  },
  {
    deptCode: "460107669431",
    deptName: "海口市琼山区人民法院",
  },
  {
    deptCode: "460107880000",
    deptName: "测试派出所",
  },
  {
    deptCode: "460107056200",
    deptName: "刑警大队阵控中队",
  },
  {
    deptCode: "460107056300",
    deptName: "刑警大队技术中队",
  },
  {
    deptCode: "460107050900",
    deptName: "刑警大队技术中队",
  },
  {
    deptCode: "460107056800",
    deptName: "刑警大队便衣中队",
  },
  {
    deptCode: "460107056500",
    deptName: "刑警大队三中队",
  },
  {
    deptCode: "460107056400",
    deptName: "刑警大队五中队",
  },
  {
    deptCode: "460107056600",
    deptName: "刑警大队二中队",
  },
  {
    deptCode: "460107056700",
    deptName: "刑警大队四中队",
  },
  {
    deptCode: "460107056100",
    deptName: "刑警大队一中队",
  },
  {
    deptCode: "460107410300",
    deptName: "巡防大队三中队",
  },
  {
    deptCode: "460107410100",
    deptName: "巡防大队一中队",
  },
  {
    deptCode: "460107410200",
    deptName: "巡防大队二中队",
  },
  {
    deptCode: "460108010000",
    deptName: "国内安全保卫大队",
  },
  {
    deptCode: "460108030000",
    deptName: "治安警察大队",
  },
  {
    deptCode: "460108050000",
    deptName: "刑警大队",
  },
  {
    deptCode: "460108240000",
    deptName: "强制隔离戒毒所",
  },
  {
    deptCode: "460108160000",
    deptName: "强制隔离戒毒所",
  },
  {
    deptCode: "460108060000",
    deptName: "刑事技术大队",
  },
  {
    deptCode: "460108320000",
    deptName: "纪检监察室",
  },
  {
    deptCode: "460108020000",
    deptName: "经侦大队",
  },
  {
    deptCode: "460108470000",
    deptName: "边防总队海口市边防支队美兰大队",
  },
  {
    deptCode: "460108410000",
    deptName: "巡逻防控大队",
  },
  {
    deptCode: "460108210000",
    deptName: "禁毒大队",
  },
  {
    deptCode: "460108350000",
    deptName: "政治处",
  },
  {
    deptCode: "460108099000",
    deptName: "局领导",
  },
  {
    deptCode: "460108590000",
    deptName: "和平南派出所",
  },
  {
    deptCode: "460108580000",
    deptName: "人民路派出所",
  },
  {
    deptCode: "460108550000",
    deptName: "海府路派出所",
  },
  {
    deptCode: "460108620000",
    deptName: "三江派出所",
  },
  {
    deptCode: "460108530000",
    deptName: "海甸派出所",
  },
  {
    deptCode: "460108560000",
    deptName: "蓝天派出所",
  },
  {
    deptCode: "460108510000",
    deptName: "博爱派出所",
  },
  {
    deptCode: "460108180000",
    deptName: "法制科",
  },
  {
    deptCode: "460108910000",
    deptName: "新江派出所",
  },
  {
    deptCode: "460108710000",
    deptName: "桂林洋海岸派出所",
  },
  {
    deptCode: "460108770000",
    deptName: "三江湾海岸派出所",
  },
  {
    deptCode: "460108740000",
    deptName: "红岛海岸派出所",
  },
  {
    deptCode: "460108570000",
    deptName: "白龙派出所",
  },
  {
    deptCode: "460108610000",
    deptName: "演丰派出所",
  },
  {
    deptCode: "460108600000",
    deptName: "灵山派出所",
  },
  {
    deptCode: "460108460000",
    deptName: "办证中心",
  },
  {
    deptCode: "460108700000",
    deptName: "便衣大队",
  },
  {
    deptCode: "460108730000",
    deptName: "东营海岸派出所",
  },
  {
    deptCode: "460108720000",
    deptName: "塔市海岸派出所",
  },
  {
    deptCode: "460108920000",
    deptName: "桂林洋派出所",
  },
  {
    deptCode: "460108669432",
    deptName: "海口市美兰区人民检察院",
  },
  {
    deptCode: "460108760000",
    deptName: "新埠海岸派出所",
  },
  {
    deptCode: "460108640000",
    deptName: "高校区派出所",
  },
  {
    deptCode: "460108630000",
    deptName: "大致坡派出所",
  },
  {
    deptCode: "460108040000",
    deptName: "美兰指挥室",
  },
  {
    deptCode: "460108520000",
    deptName: "白沙派出所",
  },
  {
    deptCode: "460108669431",
    deptName: "海口市美兰区人民法院",
  },
  {
    deptCode: "460108650000",
    deptName: "咸来派出所",
  },
  {
    deptCode: "460108056200",
    deptName: "刑警大队阵控中队",
  },
  {
    deptCode: "460108056300",
    deptName: "刑警大队重案中队",
  },
  {
    deptCode: "460108056400",
    deptName: "刑警大队预审中队",
  },
  {
    deptCode: "460108057200",
    deptName: "刑警大队便衣中队",
  },
  {
    deptCode: "460108056100",
    deptName: "刑警大队技术中队",
  },
  {
    deptCode: "460108056700",
    deptName: "刑警大队三中队",
  },
  {
    deptCode: "460108057000",
    deptName: "刑警大队六中队",
  },
  {
    deptCode: "460108056800",
    deptName: "刑警大队四中队",
  },
  {
    deptCode: "460108056900",
    deptName: "刑警大队五中队",
  },
  {
    deptCode: "460108057100",
    deptName: "刑警大队七中队",
  },
  {
    deptCode: "460108056500",
    deptName: "刑警大队一中队",
  },
  {
    deptCode: "460108056600",
    deptName: "刑警大队二中队",
  },
  {
    deptCode: "460108416500",
    deptName: "巡逻防控大队治安检查站",
  },
  {
    deptCode: "460108416300",
    deptName: "巡逻防控大队三中队",
  },
  {
    deptCode: "460108416100",
    deptName: "巡逻防控大队一中队",
  },
  {
    deptCode: "460108416200",
    deptName: "巡逻防控大队二中队",
  },
  {
    deptCode: "460108416400",
    deptName: "巡逻防控大队四中队",
  },
  {
    deptCode: "460109050000",
    deptName: "刑警大队",
  },
  {
    deptCode: "460109040000",
    deptName: "开发区指挥室",
  },
  {
    deptCode: "460109520000",
    deptName: "高新区派出所",
  },
  {
    deptCode: "460109510000",
    deptName: "金盘派出所",
  },
  {
    deptCode: "460109350000",
    deptName: "政工纪检科",
  },
  {
    deptCode: "460109530000",
    deptName: "美安派出所",
  },
  {
    deptCode: "460109030000",
    deptName: "治安大队",
  },
  {
    deptCode: "460109010000",
    deptName: "国保大队",
  },
  {
    deptCode: "460109099000",
    deptName: "局领导",
  },
  {
    deptCode: "460109180000",
    deptName: "法制科",
  },
  {
    deptCode: "460100110500",
    deptName: "网警支队四大队",
  },
  {
    deptCode: "460110030100",
    deptName: "治安消防大队",
  },
  {
    deptCode: "460110030300",
    deptName: "机场派出所",
  },
  {
    deptCode: "460110099000",
    deptName: "机场分局局领导",
  },
  {
    deptCode: "460110020100",
    deptName: "空防警卫大队",
  },
  {
    deptCode: "460110010200",
    deptName: "政工纪检室",
  },
  {
    deptCode: "460110030200",
    deptName: "刑警大队",
  },
  {
    deptCode: "460110010100",
    deptName: "美兰国际机场指挥室",
  },
  {
    deptCode: "460110020000",
    deptName: "空防警卫处",
  },
  {
    deptCode: "460110030000",
    deptName: "治安刑侦处",
  },
  {
    deptCode: "460110020200",
    deptName: "交警大队",
  },
  {
    deptCode: "460110010000",
    deptName: "警令处",
  },
  {
    deptCode: "460000000000",
    deptName: "海南省公安厅",
  },
  {
    deptCode: "460400000000",
    deptName: "儋州市公安局",
  },
  {
    deptCode: "460400030000",
    deptName: "治安警察支队",
  },
  {
    deptCode: "460400020000",
    deptName: "经济犯罪侦查支队",
  },
  {
    deptCode: "460400010000",
    deptName: "国内安全保卫支队",
  },
  {
    deptCode: "460400050000",
    deptName: "刑事警察支队",
  },
  {
    deptCode: "460400060000",
    deptName: "出入境管理支队",
  },
  {
    deptCode: "460400070000",
    deptName: "特警支队",
  },
  {
    deptCode: "460400100000",
    deptName: "警令保障部情报中心",
  },
  {
    deptCode: "460400110000",
    deptName: "网络警察支队",
  },
  {
    deptCode: "460400120000",
    deptName: "技术侦察支队",
  },
  {
    deptCode: "460400130000",
    deptName: "监所管理支队",
  },
  {
    deptCode: "460400140000",
    deptName: "海南省儋州市第一看守所",
  },
  {
    deptCode: "460400160000",
    deptName: "海南省儋州市强制隔离戒毒所",
  },
  {
    deptCode: "460400170000",
    deptName: "交通警察支队",
  },
  {
    deptCode: "460400210000",
    deptName: "禁毒支队",
  },
  {
    deptCode: "460400250000",
    deptName: "警令保障部",
  },
  {
    deptCode: "460400260000",
    deptName: "警务保障处",
  },
  {
    deptCode: "460400270000",
    deptName: "反恐怖工作支队",
  },
  {
    deptCode: "460400290000",
    deptName: "警务督察支队",
  },
  {
    deptCode: "460400300000",
    deptName: "旅游警察支队",
  },
  {
    deptCode: "460400310000",
    deptName: "生态警察支队",
  },
  {
    deptCode: "460400350000",
    deptName: "政治部",
  },
  {
    deptCode: "460400390100",
    deptName: "法制支队",
  },
  {
    deptCode: "460400390200",
    deptName: "公安监管医院看守大队",
  },
  {
    deptCode: "460000440701",
    deptName: "海头港海岸派出所",
  },
  {
    deptCode: "460400016000",
    deptName: "南华港海岸派出所",
  },
  {
    deptCode: "460400039000",
    deptName: "松鸣海岸派出所",
  },
  {
    deptCode: "460400040000",
    deptName: "白马井海岸派出所",
  },
  {
    deptCode: "460400013000",
    deptName: "新英海岸派出所",
  },
  {
    deptCode: "460400028000",
    deptName: "龙门港海岸派出所",
  },
  {
    deptCode: "460400018000",
    deptName: "兰训海岸派出所",
  },
  {
    deptCode: "460400035000",
    deptName: "松林海岸派出所",
  },
  {
    deptCode: "460400031000",
    deptName: "银滩湾海岸派出所",
  },
  {
    deptCode: "460400005000",
    deptName: "西培派出所",
  },
  {
    deptCode: "460400400200",
    deptName: "西华派出所",
  },
  {
    deptCode: "460400012000",
    deptName: "西庆派出所",
  },
  {
    deptCode: "460400038000",
    deptName: "西联派出所",
  },
  {
    deptCode: "460400022000",
    deptName: "西流派出所",
  },
  {
    deptCode: "460400400600",
    deptName: "蓝洋城派出所",
  },
  {
    deptCode: "460400023000",
    deptName: "新盈派出所",
  },
  {
    deptCode: "460400036000",
    deptName: "红岭派出所",
  },
  {
    deptCode: "460400037000",
    deptName: "龙山派出所",
  },
  {
    deptCode: "460400420100",
    deptName: "番加林区派出所",
  },
  {
    deptCode: "460400420200",
    deptName: "新州林区派出所",
  },
  {
    deptCode: "460400003000",
    deptName: "解放派出所",
  },
  {
    deptCode: "460400002000",
    deptName: "东风派出所",
  },
  {
    deptCode: "460400004000",
    deptName: "前进派出所",
  },
  {
    deptCode: "460400024000",
    deptName: "和庆派出所",
  },
  {
    deptCode: "460400025000",
    deptName: "兰洋派出所",
  },
  {
    deptCode: "460400014000",
    deptName: "雅星派出所",
  },
  {
    deptCode: "460400026000",
    deptName: "南丰派出所",
  },
  {
    deptCode: "460400033000",
    deptName: "白马井派出所",
  },
  {
    deptCode: "460400034000",
    deptName: "王五派出所",
  },
  {
    deptCode: "460400015000",
    deptName: "大成派出所",
  },
  {
    deptCode: "460400009000",
    deptName: "新州派出所",
  },
  {
    deptCode: "460400620000",
    deptName: "中和派出所",
  },
  {
    deptCode: "460400029000",
    deptName: "木棠派出所",
  },
  {
    deptCode: "460400008000",
    deptName: "东成派出所",
  },
  {
    deptCode: "460400006000",
    deptName: "宝岛派出所",
  },
  {
    deptCode: "460400041000",
    deptName: "松涛水库派出所",
  },
  {
    deptCode: "460400770000",
    deptName: "光村派出所",
  },
  {
    deptCode: "460400820000",
    deptName: "海头派出所",
  },
  {
    deptCode: "460400840000",
    deptName: "峨蔓派出所",
  },
  {
    deptCode: "460400850000",
    deptName: "排浦派出所",
  },
  {
    deptCode: "460400860000",
    deptName: "洛基派出所",
  },
  {
    deptCode: "460400870000",
    deptName: "白马井高铁站派出所",
  },
  {
    deptCode: "460409501000",
    deptName: "小铲滩海岸派出所",
  },
  {
    deptCode: "460409502000",
    deptName: "新英湾派出所",
  },
  {
    deptCode: "460409503000",
    deptName: "新都派出所",
  },
  {
    deptCode: "460409504000",
    deptName: "新英湾海岸派出所",
  },
  {
    deptCode: "460409505000",
    deptName: "新都海岸派出所",
  },
  {
    deptCode: "460409506000",
    deptName: "三都海岸派出所",
  },
  {
    deptCode: "460000200014",
    deptName: "海口铁路公安处白马井站派出所",
  },
  {
    deptCode: "460400010100",
    deptName: "情报信息大队",
  },
  {
    deptCode: "460400010200",
    deptName: "综合侦察大队",
  },
  {
    deptCode: "460400020100",
    deptName: "经济侦查一大队",
  },
  {
    deptCode: "460400020200",
    deptName: "经济侦查二大队",
  },
  {
    deptCode: "460400030100",
    deptName: "综合大队",
  },
  {
    deptCode: "460400030200",
    deptName: "治安管理大队",
  },
  {
    deptCode: "460400030300",
    deptName: "行动大队",
  },
  {
    deptCode: "460400030400",
    deptName: "户籍管理大队",
  },
  {
    deptCode: "460400050100",
    deptName: "综合大队",
  },
  {
    deptCode: "460400050300",
    deptName: "刑事侦查一大队",
  },
  {
    deptCode: "460400050400",
    deptName: "刑事侦查二大队",
  },
  {
    deptCode: "460400050500",
    deptName: "刑事侦查三大队",
  },
  {
    deptCode: "460400050600",
    deptName: "有组织犯罪侦查大队",
  },
  {
    deptCode: "460400050700",
    deptName: "警犬大队",
  },
  {
    deptCode: "460400050800",
    deptName: "刑事技术情报大队",
  },
  {
    deptCode: "460400070100",
    deptName: "特警支队综合大队",
  },
  {
    deptCode: "460400070200",
    deptName: "特警支队作训科",
  },
  {
    deptCode: "460400070500",
    deptName: "特警支队特警一大队",
  },
  {
    deptCode: "460400070600",
    deptName: "特警支队特警二大队",
  },
  {
    deptCode: "460400070700",
    deptName: "特警支队特警三大队",
  },
  {
    deptCode: "460400120100",
    deptName: "技术侦察支队综合科",
  },
  {
    deptCode: "460400120200",
    deptName: "技术侦察支队综合办案一大队",
  },
  {
    deptCode: "460400120300",
    deptName: "技术侦察支队综合办案二大队",
  },
  {
    deptCode: "460400120400",
    deptName: "技术侦察支队情报信息大队",
  },
  {
    deptCode: "460400120500",
    deptName: "技术侦察支队技术保障大队",
  },
  {
    deptCode: "460400170100",
    deptName: "交通警察支队综合大队",
  },
  {
    deptCode: "460400170200",
    deptName: "交通警察支队车辆管理所",
  },
  {
    deptCode: "460400170300",
    deptName: "交通警察支队事故处理大队",
  },
  {
    deptCode: "460400170400",
    deptName: "交通警察支队交通管理一大队",
  },
  {
    deptCode: "460400170500",
    deptName: "交通警察支队交通管理二大队",
  },
  {
    deptCode: "460400170600",
    deptName: "交通警察支队高速公路管理大队",
  },
  {
    deptCode: "460400210200",
    deptName: "禁毒支队侦查二大队",
  },
  {
    deptCode: "460400210300",
    deptName: "禁毒支队侦查三大队",
  },
  {
    deptCode: "460400210400",
    deptName: "禁毒支队侦查一大队",
  },
  {
    deptCode: "460400250100",
    deptName: "警令保障部办公室",
  },
  {
    deptCode: "460400250200",
    deptName: "警令保障部指挥中心",
  },
  {
    deptCode: "460400250300",
    deptName: "警令保障部信访科",
  },
  {
    deptCode: "460400260100",
    deptName: "警务保障处综合管理科",
  },
  {
    deptCode: "460400260200",
    deptName: "警务保障处财务管理科",
  },
  {
    deptCode: "460400260300",
    deptName: "警务保障处装备保障科",
  },
  {
    deptCode: "460400270100",
    deptName: "反恐怖工作支队综合保障大队",
  },
  {
    deptCode: "460400270200",
    deptName: "反恐怖工作支队侦查大队",
  },
  {
    deptCode: "460400350100",
    deptName: "政治部人事训练科",
  },
  {
    deptCode: "460400350200",
    deptName: "政治部宣教群工科",
  },
  {
    deptCode: "460400400000",
    deptName: "西联分局",
  },
  {
    deptCode: "460400007000",
    deptName: "八一分局",
  },
  {
    deptCode: "460400420000",
    deptName: "森林分局",
  },
  {
    deptCode: "461000000001",
    deptName: "省管市县",
  },
  {
    deptCode: "467600000000",
    deptName: "保亭县局",
  },
  {
    deptCode: "467600001000",
    deptName: "城镇派出所",
  },
  {
    deptCode: "467600002000",
    deptName: "新政派出所",
  },
  {
    deptCode: "467600003000",
    deptName: "加茂派出所",
  },
  {
    deptCode: "467600004000",
    deptName: "什玲派出所",
  },
  {
    deptCode: "467600005000",
    deptName: "响水派出所",
  },
  {
    deptCode: "467600007000",
    deptName: "保城派出所",
  },
  {
    deptCode: "467600008000",
    deptName: "三道派出所",
  },
  {
    deptCode: "467600009000",
    deptName: "毛感派出所",
  },
  {
    deptCode: "467600010000",
    deptName: "南林派出所",
  },
  {
    deptCode: "467600012000",
    deptName: "六弓派出所",
  },
  {
    deptCode: "467600015000",
    deptName: "城北派出所",
  },
  {
    deptCode: "469029310000",
    deptName: "指挥中心",
  },
  {
    deptCode: "469029310001",
    deptName: "合成作战中心",
  },
  {
    deptCode: "469029030000",
    deptName: "治安管理大队",
  },
];
export default deptData;
