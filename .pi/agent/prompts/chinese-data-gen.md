---
description: generate structured chinese data
---
<instructions>
  You are asked to extract sentences given some data. For each sentence (i.e., ending with a period, exclamation mark, or question mark), make it a JSON object. Return an object with a "sentences" key which corresponds to a list of those sentence objects. In each sentence object, include the definition and a list of characters (referred to as words). Each word should contain the character and pinyin. (Character should ALWAYS be just one character.) If the word is punctuation, put the punctuation mark in the character field and leave the pinyin field empty. ALWAYS include Pinyin tones, such as `nǐ`. Pinyin should also be lowercase. There should generally be only one question/exclamation mark or period per sentence -- one line does not necessarily equal on sentence.

If only words are provided in data, not full sentences, generate example sentences using these words. This is for Chinese beginners so try to only use words from common Chinese (i.e., from Integrated Chinese Part 1 Level 1) for the example sentences. Specific instructions may also be provided for the example sentences, which you should honor. Make sure that your translations are authentic -- they don't need to be literal, but think deeply about what a **reasonable** English equivalent would be.
</instructions>

<example>
```json
{
  "sentences": [
    {
      "def": "Li You is shopping at the store, the salesperson asks her...",
      "words": [
        {
          "character": "李",
          "pinyin": "Lǐ"
        },
        {
          "character": "友",
          "pinyin": "Yǒu"
        },
        {
          "character": "在",
          "pinyin": "zài"
        },
        {
          "character": "商",
          "pinyin": "shāng"
        },
        {
          "character": "店",
          "pinyin": "diàn"
        },
        {
          "character": "买",
          "pinyin": "mǎi"
        },
        {
          "character": "东",
          "pinyin": "dōng"
        },
        {
          "character": "西",
          "pinyin": "xi"
        },
        {
          "character": "，",
          "pinyin": ""
        },
        {
          "character": "售",
          "pinyin": "shòu"
        },
        {
          "character": "货",
          "pinyin": "huò"
        },
        {
          "character": "员",
          "pinyin": "yuán"
        },
        {
          "character": "问",
          "pinyin": "wèn"
        },
        {
          "character": "她",
          "pinyin": "tā"
        },
        {
          "character": "…",
          "pinyin": ""
        },
        {
          "character": "…",
          "pinyin": ""
        }
      ]
    },
    {
      "def": "Miss, what clothes do you want to buy?",
      "words": [
        {
          "character": "小",
          "pinyin": "Xiǎo"
        },
        {
          "character": "姐",
          "pinyin": "jiě"
        },
        {
          "character": "，",
          "pinyin": ""
        },
        {
          "character": "您",
          "pinyin": "nín"
        },
        {
          "character": "要",
          "pinyin": "yào"
        },
        {
          "character": "买",
          "pinyin": "mǎi"
        },
        {
          "character": "什",
          "pinyin": "shén"
        },
        {
          "character": "么",
          "pinyin": "me"
        },
        {
          "character": "衣",
          "pinyin": "yī"
        },
        {
          "character": "服",
          "pinyin": "fu"
        },
        {
          "character": "？",
          "pinyin": ""
        }
      ]
    },
    {
      "def": "I want to buy a shirt.",
      "words": [
        {
          "character": "我",
          "pinyin": "Wǒ"
        },
        {
          "character": "想",
          "pinyin": "xiǎng"
        },
        {
          "character": "买",
          "pinyin": "mǎi"
        },
        {
          "character": "一",
          "pinyin": "yí"
        },
        {
          "character": "件",
          "pinyin": "jiàn"
        },
        {
          "character": "衬",
          "pinyin": "chèn"
        },
        {
          "character": "衫",
          "pinyin": "shān"
        },
        {
          "character": "。",
          "pinyin": ""
        }
      ]
    },
    {
      "def": "What color do you like, yellow or red?",
      "words": [
        {
          "character": "您",
          "pinyin": "Nín"
        },
        {
          "character": "喜",
          "pinyin": "xǐ"
        },
        {
          "character": "欢",
          "pinyin": "huan"
        },
        {
          "character": "什",
          "pinyin": "shén"
        },
        {
          "character": "么",
          "pinyin": "me"
        },
        {
          "character": "颜",
          "pinyin": "yán"
        },
        {
          "character": "色",
          "pinyin": "sè"
        },
        {
          "character": "的",
          "pinyin": "de"
        },
        {
          "character": "，",
          "pinyin": ""
        },
        {
          "character": "黄",
          "pinyin": "huáng"
        },
        {
          "character": "的",
          "pinyin": "de"
        },
        {
          "character": "还",
          "pinyin": "hái"
        },
        {
          "character": "是",
          "pinyin": "shi"
        },
        {
          "character": "红",
          "pinyin": "hóng"
        },
        {
          "character": "的",
          "pinyin": "de"
        },
        {
          "character": "？",
          "pinyin": ""
        }
      ]
    },
    {
      "def": "I like to wear red.",
      "words": [
        {
          "character": "我",
          "pinyin": "Wǒ"
        },
        {
          "character": "喜",
          "pinyin": "xǐ"
        },
        {
          "character": "欢",
          "pinyin": "huan"
        },
        {
          "character": "穿",
          "pinyin": "chuān"
        },
        {
          "character": "红",
          "pinyin": "hóng"
        },
        {
          "character": "的",
          "pinyin": "de"
        },
        {
          "character": "。",
          "pinyin": ""
        }
      ]
    },
    {
      "def": "I also want to buy a pair of pants.",
      "words": [
        {
          "character": "我",
          "pinyin": "Wǒ"
        },
        {
          "character": "还",
          "pinyin": "hái"
        },
        {
          "character": "想",
          "pinyin": "xiǎng"
        },
        {
          "character": "买",
          "pinyin": "mǎi"
        },
        {
          "character": "一",
          "pinyin": "yì"
        },
        {
          "character": "条",
          "pinyin": "tiáo"
        },
        {
          "character": "裤",
          "pinyin": "kù"
        },
        {
          "character": "子",
          "pinyin": "zi"
        },
        {
          "character": "。",
          "pinyin": ""
        }
      ]
    },
    {
      "def": "How big?",
      "words": [
        {
          "character": "多",
          "pinyin": "Duō"
        },
        {
          "character": "大",
          "pinyin": "dà"
        },
        {
          "character": "的",
          "pinyin": "de"
        },
        {
          "character": "？",
          "pinyin": ""
        }
      ]
    },
    {
      "def": "Large size, medium size, or small size?",
      "words": [
        {
          "character": "大",
          "pinyin": "Dà"
        },
        {
          "character": "号",
          "pinyin": "hào"
        },
        {
          "character": "的",
          "pinyin": "de"
        },
        {
          "character": "、",
          "pinyin": ""
        },
        {
          "character": "中",
          "pinyin": "zhōng"
        },
        {
          "character": "号",
          "pinyin": "hào"
        },
        {
          "character": "的",
          "pinyin": "de"
        },
        {
          "character": "、",
          "pinyin": ""
        },
        {
          "character": "还",
          "pinyin": "hái"
        },
        {
          "character": "是",
          "pinyin": "shi"
        },
        {
          "character": "小",
          "pinyin": "xiǎo"
        },
        {
          "character": "号",
          "pinyin": "hào"
        },
        {
          "character": "的",
          "pinyin": "de"
        },
        {
          "character": "？",
          "pinyin": ""
        }
      ]
    },
    {
      "def": "Medium size.",
      "words": [
        {
          "character": "中",
          "pinyin": "Zhōng"
        },
        {
          "character": "号",
          "pinyin": "hào"
        },
        {
          "character": "的",
          "pinyin": "de"
        },
        {
          "character": "。",
          "pinyin": ""
        }
      ]
    },
    {
      "def": "Don't want too expensive, also don't want too cheap.",
      "words": [
        {
          "character": "不",
          "pinyin": "Bú"
        },
        {
          "character": "要",
          "pinyin": "yào"
        },
        {
          "character": "太",
          "pinyin": "tài"
        },
        {
          "character": "贵",
          "pinyin": "guì"
        },
        {
          "character": "的",
          "pinyin": "de"
        },
        {
          "character": "，",
          "pinyin": ""
        },
        {
          "character": "也",
          "pinyin": "yě"
        },
        {
          "character": "不",
          "pinyin": "bú"
        },
        {
          "character": "要",
          "pinyin": "yào"
        },
        {
          "character": "太",
          "pinyin": "tài"
        },
        {
          "character": "便",
          "pinyin": "pián"
        },
        {
          "character": "宜",
          "pinyin": "yi"
        },
        {
          "character": "的",
          "pinyin": "de"
        },
        {
          "character": "。",
          "pinyin": ""
        }
      ]
    },
    {
      "def": "How about this pair of pants?",
      "words": [
        {
          "character": "这",
          "pinyin": "Zhè"
        },
        {
          "character": "条",
          "pinyin": "tiáo"
        },
        {
          "character": "裤",
          "pinyin": "kù"
        },
        {
          "character": "子",
          "pinyin": "zi"
        },
        {
          "character": "怎",
          "pinyin": "zěn"
        },
        {
          "character": "么",
          "pinyin": "me"
        },
        {
          "character": "样",
          "pinyin": "yàng"
        },
        {
          "character": "？",
          "pinyin": ""
        }
      ]
    },
    {
      "def": "The color is very good.",
      "words": [
        {
          "character": "颜",
          "pinyin": "Yán"
        },
        {
          "character": "色",
          "pinyin": "sè"
        },
        {
          "character": "很",
          "pinyin": "hěn"
        },
        {
          "character": "好",
          "pinyin": "hǎo"
        },
        {
          "character": "。",
          "pinyin": ""
        }
      ]
    },
    {
      "def": "If the length is suitable, I'll buy it.",
      "words": [
        {
          "character": "如",
          "pinyin": "Rú"
        },
        {
          "character": "果",
          "pinyin": "guǒ"
        },
        {
          "character": "长",
          "pinyin": "cháng"
        },
        {
          "character": "短",
          "pinyin": "duǎn"
        },
        {
          "character": "合",
          "pinyin": "hé"
        },
        {
          "character": "适",
          "pinyin": "shì"
        },
        {
          "character": "的",
          "pinyin": "de"
        },
        {
          "character": "话",
          "pinyin": "huà"
        },
        {
          "character": "，",
          "pinyin": ""
        },
        {
          "character": "我",
          "pinyin": "wǒ"
        },
        {
          "character": "就",
          "pinyin": "jiù"
        },
        {
          "character": "买",
          "pinyin": "mǎi"
        },
        {
          "character": "。",
          "pinyin": ""
        }
      ]
    },
    {
      "def": "Please try it on.",
      "words": [
        {
          "character": "您",
          "pinyin": "Nín"
        },
        {
          "character": "试",
          "pinyin": "shì"
        },
        {
          "character": "一",
          "pinyin": "yí"
        },
        {
          "character": "下",
          "pinyin": "xià"
        },
        {
          "character": "。",
          "pinyin": ""
        }
      ]
    },
    {
      "def": "No need to try.",
      "words": [
        {
          "character": "不",
          "pinyin": "Bú"
        },
        {
          "character": "用",
          "pinyin": "yòng"
        },
        {
          "character": "试",
          "pinyin": "shì"
        },
        {
          "character": "。",
          "pinyin": ""
        }
      ]
    },
    {
      "def": "Okay.",
      "words": [
        {
          "character": "可",
          "pinyin": "Kě"
        },
        {
          "character": "以",
          "pinyin": "yǐ"
        },
        {
          "character": "。",
          "pinyin": ""
        }
      ]
    },
    {
      "def": "What about this shirt?",
      "words": [
        {
          "character": "这",
          "pinyin": "Zhè"
        },
        {
          "character": "件",
          "pinyin": "jiàn"
        },
        {
          "character": "衬",
          "pinyin": "chèn"
        },
        {
          "character": "衫",
          "pinyin": "shān"
        },
        {
          "character": "呢",
          "pinyin": "ne"
        },
        {
          "character": "？",
          "pinyin": ""
        }
      ]
    },
    {
      "def": "Also not bad.",
      "words": [
        {
          "character": "也",
          "pinyin": "Yě"
        },
        {
          "character": "不",
          "pinyin": "bú"
        },
        {
          "character": "错",
          "pinyin": "cuò"
        },
        {
          "character": "。",
          "pinyin": ""
        }
      ]
    },
    {
      "def": "How much altogether?",
      "words": [
        {
          "character": "一",
          "pinyin": "Yí"
        },
        {
          "character": "共",
          "pinyin": "gòng"
        },
        {
          "character": "多",
          "pinyin": "duō"
        },
        {
          "character": "少",
          "pinyin": "shao"
        },
        {
          "character": "钱",
          "pinyin": "qián"
        },
        {
          "character": "？",
          "pinyin": ""
        }
      ]
    },
    {
      "def": "Shirt is $21.50, pants are $32.99,",
      "words": [
        {
          "character": "衬",
          "pinyin": "Chèn"
        },
        {
          "character": "衫",
          "pinyin": "shān"
        },
        {
          "character": "二",
          "pinyin": "èr"
        },
        {
          "character": "十",
          "pinyin": "shí"
        },
        {
          "character": "一",
          "pinyin": "yī"
        },
        {
          "character": "块",
          "pinyin": "kuài"
        },
        {
          "character": "五",
          "pinyin": "wǔ"
        },
        {
          "character": "，",
          "pinyin": ""
        },
        {
          "character": "裤",
          "pinyin": "kù"
        },
        {
          "character": "子",
          "pinyin": "zi"
        },
        {
          "character": "三",
          "pinyin": "sān"
        },
        {
          "character": "十",
          "pinyin": "shí"
        },
        {
          "character": "二",
          "pinyin": "èr"
        },
        {
          "character": "块",
          "pinyin": "kuài"
        },
        {
          "character": "九",
          "pinyin": "jiǔ"
        },
        {
          "character": "毛",
          "pinyin": "máo"
        },
        {
          "character": "九",
          "pinyin": "jiǔ"
        },
        {
          "character": "，",
          "pinyin": ""
        }
      ]
    },
    {
      "def": "Altogether it's $54.49.",
      "words": [
        {
          "character": "一",
          "pinyin": "yí"
        },
        {
          "character": "共",
          "pinyin": "gòng"
        },
        {
          "character": "是",
          "pinyin": "shì"
        },
        {
          "character": "五",
          "pinyin": "wǔ"
        },
        {
          "character": "十",
          "pinyin": "shí"
        },
        {
          "character": "四",
          "pinyin": "sì"
        },
        {
          "character": "块",
          "pinyin": "kuài"
        },
        {
          "character": "四",
          "pinyin": "sì"
        },
        {
          "character": "毛",
          "pinyin": "máo"
        },
        {
          "character": "九",
          "pinyin": "jiǔ"
        },
        {
          "character": "分",
          "pinyin": "fēn"
        },
        {
          "character": "。",
          "pinyin": ""
        }
      ]
    },
    {
      "def": "Okay, this is $100.",
      "words": [
        {
          "character": "好",
          "pinyin": "Hǎo"
        },
        {
          "character": "，",
          "pinyin": ""
        },
        {
          "character": "这",
          "pinyin": "zhè"
        },
        {
          "character": "是",
          "pinyin": "shì"
        },
        {
          "character": "一",
          "pinyin": "yì"
        },
        {
          "character": "百",
          "pinyin": "bǎi"
        },
        {
          "character": "块",
          "pinyin": "kuài"
        },
        {
          "character": "钱",
          "pinyin": "qián"
        },
        {
          "character": "。",
          "pinyin": ""
        }
      ]
    },
    {
      "def": "Your change is $45.51.",
      "words": [
        {
          "character": "找",
          "pinyin": "Zhǎo"
        },
        {
          "character": "您",
          "pinyin": "nín"
        },
        {
          "character": "四",
          "pinyin": "sì"
        },
        {
          "character": "十",
          "pinyin": "shí"
        },
        {
          "character": "五",
          "pinyin": "wǔ"
        },
        {
          "character": "块",
          "pinyin": "kuài"
        },
        {
          "character": "五",
          "pinyin": "wǔ"
        },
        {
          "character": "毛",
          "pinyin": "máo"
        },
        {
          "character": "一",
          "pinyin": "yī"
        },
        {
          "character": "。",
          "pinyin": ""
        }
      ]
    },
    {
      "def": "Thank you.",
      "words": [
        {
          "character": "谢",
          "pinyin": "Xiè"
        },
        {
          "character": "谢",
          "pinyin": "xie"
        },
        {
          "character": "。",
          "pinyin": ""
        }
      ]
    }
  ]
}
```
</example>

<instructions>
  You are asked to describe sentences given some data. For each sentence (i.e., ending with a period, exclamation mark, or question mark), make it a JSON object. Return an object with a "sentences" key which corresponds to a list of those sentence objects. In each sentence object, include the definition and a list of characters (referred to as words). Each word should contain the character and pinyin. (Character should ALWAYS be just one character.) If the word is punctuation, put the punctuation mark in the character field and leave the pinyin field empty. ALWAYS include Pinyin tones, such as `nǐ`. Pinyin should also be lowercase. There should generally be only one question/exclamation mark or period per sentence -- one line does not necessarily equal on sentence.

If only words are provided in data, not full sentences, generate example sentences using these words. This is for Chinese beginners so try to only use words from common Chinese (i.e., from Integrated Chinese Part 1 Level 1) for the example sentences. Specific instructions may also be provided for the example sentences, which you should honor. Make sure that your translations are authentic -- they don't need to be literal, but think deeply about what a **reasonable** English equivalent would be.
</instructions>
