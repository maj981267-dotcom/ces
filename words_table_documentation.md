# 单词表(words)数据库字段文档

## 表概述
- **表名**: `words`
- **用途**: 存储英语单词的详细信息，包括词性、释义、例句、词汇扩展和学习辅助信息
- **字符集**: `utf8mb4`
- **排序规则**: `utf8mb4_unicode_ci`
- **存储引擎**: `InnoDB`

## 建表语句

```sql
-- 创建数据库
CREATE DATABASE word_memory_system CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE word_memory_system;

-- 创建单词表
CREATE TABLE words (
    word VARCHAR(100) PRIMARY KEY COMMENT '英文单词',
    common_meanings JSON NOT NULL COMMENT '常用释义(JSON格式: {"n.": ["常用名词释义1", "常用名词释义2"], "v.": ["常用动词释义1"]})',
    uncommon_meanings JSON COMMENT '不常用释义(JSON格式: {"n.": ["不常用名词释义1"], "adj.": ["不常用形容词释义1"]})',
    english_examples JSON NOT NULL COMMENT '英文例句和中文释义(JSON格式: [{"en": "英文例句", "cn": "中文释义"}])',
    synonyms JSON COMMENT '近义词(JSON格式: [{"word": "近义词", "meaning": "释义"}])',
    antonyms JSON COMMENT '反义词(JSON格式: [{"word": "反义词", "meaning": "释义"}])',
    derivatives JSON COMMENT '派生词(JSON格式: [{"word": "派生词", "meaning": "释义", "type": "形容词/副词等"}])',
    prefixes JSON COMMENT '前缀(JSON格式: [{"prefix": "前缀", "meaning": "前缀含义"}])',
    roots JSON COMMENT '词根(JSON格式: [{"root": "词根", "meaning": "词根含义"}])',
    collocations JSON COMMENT '词组搭配(JSON格式: [{"phrase": "词组", "meaning": "释义"}])',
    importance_level VARCHAR(20) COMMENT '重要等级(如: 高、中、低 或 1-5级)',
    memory_aid TEXT COMMENT '辅助记忆(记忆技巧、联想方法等)',
    imported_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '导入时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='单词表';
```

## 字段详细说明

### 1. word
- **含义**: 英文单词本身
- **类型**: `VARCHAR(100)`
- **约束**: `PRIMARY KEY` (主键)
- **是否必填**: 是
- **说明**: 存储要学习的英文单词，作为表的唯一标识
- **示例**: `"develop"`, `"beautiful"`, `"computer"`

### 2. common_meanings
- **含义**: 常用释义
- **类型**: `JSON`
- **约束**: `NOT NULL`
- **是否必填**: 是
- **说明**: 存储单词最常用的词性和对应的中文释义，学习者应优先掌握这些含义
- **JSON格式**: 
  ```json
  {
    "词性1": ["释义1", "释义2"],
    "词性2": ["释义1"]
  }
  ```
- **示例**: 
  ```json
  {
    "v.": ["开发", "发展"],
    "n.": ["发展"]
  }
  ```

### 3. uncommon_meanings
- **含义**: 不常用释义
- **类型**: `JSON`
- **约束**: 无 (可为NULL)
- **是否必填**: 否
- **说明**: 存储单词较少使用的词性和释义，用于扩展词汇知识
- **JSON格式**: 
  ```json
  {
    "词性1": ["释义1", "释义2"],
    "词性2": ["释义1"]
  }
  ```
- **示例**: 
  ```json
  {
    "adj.": ["发达的"],
    "n.": ["显影剂"]
  }
  ```

### 4. english_examples
- **含义**: 英文例句和中文释义
- **类型**: `JSON`
- **约束**: `NOT NULL`
- **是否必填**: 是
- **说明**: 提供单词在实际语境中的使用例句，帮助理解和记忆
- **JSON格式**: 
  ```json
  [
    {"en": "英文例句1", "cn": "中文释义1"},
    {"en": "英文例句2", "cn": "中文释义2"}
  ]
  ```
- **示例**: 
  ```json
  [
    {"en": "We need to develop new software.", "cn": "我们需要开发新软件。"},
    {"en": "Children develop rapidly.", "cn": "儿童发展迅速。"}
  ]
  ```

### 5. synonyms
- **含义**: 近义词
- **类型**: `JSON`
- **约束**: 无 (可为NULL)
- **是否必填**: 否
- **说明**: 存储与该单词意思相近的其他单词，扩展词汇量
- **JSON格式**: 
  ```json
  [
    {"word": "近义词1", "meaning": "释义1"},
    {"word": "近义词2", "meaning": "释义2"}
  ]
  ```
- **示例**: 
  ```json
  [
    {"word": "create", "meaning": "创造"},
    {"word": "build", "meaning": "建造"}
  ]
  ```

### 6. antonyms
- **含义**: 反义词
- **类型**: `JSON`
- **约束**: 无 (可为NULL)
- **是否必填**: 否
- **说明**: 存储与该单词意思相反的单词，通过对比加深理解
- **JSON格式**: 
  ```json
  [
    {"word": "反义词1", "meaning": "释义1"},
    {"word": "反义词2", "meaning": "释义2"}
  ]
  ```
- **示例**: 
  ```json
  [
    {"word": "destroy", "meaning": "破坏"},
    {"word": "decline", "meaning": "衰退"}
  ]
  ```

### 7. derivatives
- **含义**: 派生词
- **类型**: `JSON`
- **约束**: 无 (可为NULL)
- **是否必填**: 否
- **说明**: 存储由该单词派生出来的其他单词，如名词、形容词、副词等形式
- **JSON格式**: 
  ```json
  [
    {"word": "派生词1", "meaning": "释义1", "type": "词性1"},
    {"word": "派生词2", "meaning": "释义2", "type": "词性2"}
  ]
  ```
- **示例**: 
  ```json
  [
    {"word": "development", "meaning": "发展", "type": "n."},
    {"word": "developer", "meaning": "开发者", "type": "n."}
  ]
  ```

### 8. prefixes
- **含义**: 前缀
- **类型**: `JSON`
- **约束**: 无 (可为NULL)
- **是否必填**: 否
- **说明**: 存储单词的前缀及其含义，帮助理解词汇构成规律
- **JSON格式**: 
  ```json
  [
    {"prefix": "前缀1", "meaning": "前缀含义1"},
    {"prefix": "前缀2", "meaning": "前缀含义2"}
  ]
  ```
- **示例**: 
  ```json
  [
    {"prefix": "de-", "meaning": "向下，去除"}
  ]
  ```

### 9. roots
- **含义**: 词根
- **类型**: `JSON`
- **约束**: 无 (可为NULL)
- **是否必填**: 否
- **说明**: 存储单词的词根及其含义，帮助理解单词的核心意思和记忆
- **JSON格式**: 
  ```json
  [
    {"root": "词根1", "meaning": "词根含义1"},
    {"root": "词根2", "meaning": "词根含义2"}
  ]
  ```
- **示例**: 
  ```json
  [
    {"root": "velop", "meaning": "包裹，展开"}
  ]
  ```

### 10. collocations
- **含义**: 词组搭配
- **类型**: `JSON`
- **约束**: 无 (可为NULL)
- **是否必填**: 否
- **说明**: 存储该单词常见的词组搭配和短语，提高语言运用能力
- **JSON格式**: 
  ```json
  [
    {"phrase": "词组1", "meaning": "释义1"},
    {"phrase": "词组2", "meaning": "释义2"}
  ]
  ```
- **示例**: 
  ```json
  [
    {"phrase": "develop into", "meaning": "发展成为"},
    {"phrase": "software development", "meaning": "软件开发"}
  ]
  ```

### 11. importance_level
- **含义**: 重要等级
- **类型**: `VARCHAR(20)`
- **约束**: 无 (可为NULL)
- **是否必填**: 否
- **说明**: 标记单词的重要程度，用于学习优先级排序
- **建议值**: `"高"`, `"中"`, `"低"` 或 `"1"`, `"2"`, `"3"`, `"4"`, `"5"`
- **示例**: `"高"`, `"中"`, `"低"`

### 12. memory_aid
- **含义**: 辅助记忆
- **类型**: `TEXT`
- **约束**: 无 (可为NULL)
- **是否必填**: 否
- **说明**: 存储帮助记忆该单词的技巧、联想方法、助记符等信息
- **示例**: `"记忆技巧：de(去掉) + velop(包裹) = 去掉包裹，展开发展。联想：开发者(developer)去掉包裹展开新功能。"`

### 13. imported_at
- **含义**: 导入时间
- **类型**: `TIMESTAMP`
- **约束**: `DEFAULT CURRENT_TIMESTAMP`
- **是否必填**: 否 (自动生成)
- **说明**: 记录单词被导入到数据库的时间戳，用于追踪学习历史
- **示例**: `"2026-04-20 08:00:00"`

## 必填字段总结

以下字段为必填字段，创建单词记录时必须提供：

1. **word** - 英文单词本身
2. **common_meanings** - 常用释义
3. **english_examples** - 英文例句

其他字段均为可选，可以根据实际需要填写。

## 索引信息
- **主键索引**: `word` (PRIMARY KEY)

## 约束说明
1. **必填字段**: `word`, `common_meanings`, `english_examples`
2. **可选字段**: 其他所有字段均可为NULL
3. **字符编码**: 支持UTF-8，可存储中文、英文及特殊符号
4. **JSON字段**: 使用MySQL 5.7+的原生JSON类型，支持JSON函数查询

## 使用注意事项
1. JSON字段在插入时需要确保格式正确
2. 建议在应用层对JSON数据进行验证
3. 查询JSON字段时可使用MySQL的JSON函数，如`JSON_EXTRACT()`, `JSON_CONTAINS()`等
4. `importance_level`字段建议使用统一的标准值
5. `memory_aid`字段长度较大，适合存储详细的记忆辅助信息
6. `common_meanings`和`uncommon_meanings`的区分有助于学习者优先掌握核心含义

## 常用查询示例

### 查看所有单词基本信息
```sql
SELECT word, importance_level, imported_at 
FROM words 
ORDER BY imported_at;
```

### 查看单词的完整信息（格式化JSON）
```sql
SELECT 
    word,
    JSON_PRETTY(common_meanings) as 常用释义,
    JSON_PRETTY(uncommon_meanings) as 不常用释义,
    JSON_PRETTY(english_examples) as 英文例句,
    importance_level,
    memory_aid
FROM words 
WHERE word = 'develop';
```

### 按重要等级统计
```sql
SELECT importance_level, COUNT(*) as 单词数量 
FROM words 
GROUP BY importance_level;
```

### 查询包含特定词性的单词
```sql
SELECT word, common_meanings
FROM words 
WHERE JSON_CONTAINS_PATH(common_meanings, 'one', '$.v.');
```

### 搜索包含特定释义的单词
```sql
SELECT word, common_meanings
FROM words 
WHERE JSON_SEARCH(common_meanings, 'one', '%开发%') IS NOT NULL;
```