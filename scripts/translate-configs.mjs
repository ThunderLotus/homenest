import fs from 'node:fs'
import { parse, stringify } from 'yaml'

const GROUP_TRANSLATIONS = {
  '常用推荐': 'Featured',
  '媒体资讯': 'News & Media',
  'AI工具包': 'AI Tools',
  '开发者工具包': 'Developer Tools',
  '投资者工具包': 'Investment Tools',
  '自媒体工具包': 'Creator Tools',
  '常用工具': 'Utilities',
  '素材资源': 'Design Assets',
  '开源项目': 'Open Source',
  '1Panel管理': '1Panel Management',
  '官方政府': 'Government',
}

const SERVICE_TRANSLATIONS = {
  'Google 云端硬盘': { title: 'Google Drive', description: 'Cloud storage and file sharing by Google.' },
  'Google 趋势': { title: 'Google Trends', description: 'Explore what the world is searching for.' },
  'Google 分析': { title: 'Google Analytics', description: 'Web analytics service offered by Google.' },
  '截图美化工具': { title: 'Screenshot Beautifier', description: 'Beautify screenshots with device frames for browser, iPhone, iPad, MacBook, Apple Watch.' },
  'NewKit - 在线效率工具箱': { title: 'NewKit - Online Toolkit', description: 'Online productivity tools collection.' },
  '公众号助手': { title: 'WeChat Official Account', description: 'WeChat Official Account management platform.' },
  '视频号助手': { title: 'WeChat Channels', description: 'WeChat Channels creator platform.' },
  '小红书创作中心': { title: 'Xiaohongshu Creator', description: 'Xiaohongshu (RED) creator center.' },
  '微信公众平台': { title: 'WeChat Platform', description: 'WeChat Official Account platform.' },
  '小报童': { title: 'Xiaobaotong', description: 'Newsletter publishing platform.' },
  '知识星球': { title: 'Knowledge Planet', description: 'Knowledge sharing community platform.' },
  '看财报': { title: 'Kancaibao', description: 'Financial report analysis tool.' },
  '巨潮资讯网': { title: 'CNINFO', description: 'China Securities Regulatory Commission information disclosure platform.' },
  '价值投资导航数据': { title: 'Value Investing Data', description: 'Value investing navigation and data service.' },
  '集思录': { title: 'Jisilu', description: 'Bond and fund data platform.' },
  '集思录-实时数据': { title: 'Jisilu - Live Data', description: 'Real-time bond and fund data.' },
  '宝塔': { title: 'BT Panel', description: 'Server management panel.' },
  '腾讯朱雀AI文本检测': { title: 'Tencent Zhuque AI Detector', description: 'AI-generated text detection by Tencent.' },
  'SQL格式化': { title: 'SQL Formatter', description: 'Online SQL formatting tool.' },
  'Checkmate-监控服务': { title: 'Checkmate - Monitoring', description: 'USA-Home' },
  '提示词优化': { title: 'Prompt Optimizer', description: 'External' },
  'ReadmeX': { title: 'ReadmeX', description: 'Project Analysis' },
  '小爱音箱播放': { title: 'Xiaoai Speaker Play', description: '' },
  '小爱音箱管理': { title: 'Xiaoai Speaker Manager', description: '' },
  '在线图像处理': { title: 'Online Image Processor', description: '' },
  '相片处理': { title: 'Photo Processor', description: 'USA-Home' },
  '百度脑图': { title: 'Baidu Mind Map', description: 'USA-Home' },
  'DrawNix-白板': { title: 'DrawNix - Whiteboard', description: 'USA-Home' },
  '口算练习题': { title: 'Mental Math Practice', description: '' },
}

const TITLE_ONLY_TRANSLATIONS = {
  'Free for Developers': 'Free for Developers',
  'Chrome Webstore Devconsole': 'Chrome Web Store Dev Console',
}

function translateConfig(configPath, isDefault = false) {
  const raw = fs.readFileSync(configPath, 'utf8')
  const config = parse(raw)

  if (!config.baseLang) {
    config.baseLang = 'zh'
  }

  const i18n = config.i18n || {}
  i18n.groups = i18n.groups || {}
  i18n.services = i18n.services || {}

  if (config.title) {
    i18n.title = i18n.title || {}
    if (!i18n.title.en) {
      if (config.title.includes('导航')) {
        i18n.title.en = 'NavSphere Navigation'
      } else if (config.title === 'Lei Home Page') {
        i18n.title.en = 'Lei Home Page'
      } else {
        i18n.title.en = config.title
      }
    }
  }

  const services = config.services || {}
  for (const [groupTitle, items] of Object.entries(services)) {
    if (GROUP_TRANSLATIONS[groupTitle]) {
      i18n.groups[groupTitle] = i18n.groups[groupTitle] || {}
      if (!i18n.groups[groupTitle].en) {
        i18n.groups[groupTitle].en = GROUP_TRANSLATIONS[groupTitle]
      }
    }

    for (const svc of items) {
      if (!svc.id) continue
      const id = svc.id
      const needsTitle = svc.title && /[\u4e00-\u9fff]/.test(svc.title)
      const needsDesc = svc.description && /[\u4e00-\u9fff]/.test(svc.description)

      if (!needsTitle && !needsDesc) {
        const predef = SERVICE_TRANSLATIONS[svc.title]
        if (!predef) continue
      }

      i18n.services[id] = i18n.services[id] || {}
      i18n.services[id].en = i18n.services[id].en || {}

      const predef = SERVICE_TRANSLATIONS[svc.title]

      if (needsTitle && !i18n.services[id].en.title) {
        i18n.services[id].en.title = predef?.title || svc.title
      } else if (!needsTitle && !i18n.services[id].en.title && svc.title) {
        i18n.services[id].en.title = svc.title
      }

      if (needsDesc && !i18n.services[id].en.description) {
        i18n.services[id].en.description = predef?.description || svc.description
      } else if (!needsDesc && !i18n.services[id].en.description && svc.description) {
        i18n.services[id].en.description = svc.description
      }
    }
  }

  config.i18n = i18n
  fs.writeFileSync(configPath, stringify(config), 'utf8')

  const groupCount = Object.keys(i18n.groups || {}).length
  const svcCount = Object.keys(i18n.services || {}).length
  console.log(`${configPath}: ${groupCount} groups, ${svcCount} services translated`)
}

translateConfig('data/config.yml', true)
translateConfig('data/config_chenlei.yml', false)
console.log('Done!')