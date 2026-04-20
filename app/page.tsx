'use client';

import { useState, useEffect } from 'react';

interface ParsedWord {
  word: string;
  common_meanings: any;
  uncommon_meanings: any;
  english_examples: any;
  synonyms: any;
  antonyms: any;
  derivatives: any;
  prefixes: any;
  roots: any;
  collocations: any;
  confusing_words: any;
  confusable_words: any;
  context: any;
  importance_level: string;
  memory_aid: string;
  rowNumber: number;
  isDuplicate: boolean;
}

interface ReviewRule {
  rule_name: string;
  offset_days: number;
  start_time: string;
  end_time: string;
}

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [parsedWords, setParsedWords] = useState<ParsedWord[]>([]);
  const [showTable, setShowTable] = useState(false);
  const [selectedWords, setSelectedWords] = useState<Set<number>>(new Set());
  const [currentPage, setCurrentPage] = useState<'import' | 'curve' | 'word'>('import');
  
  // 复习规则相关状态
  const [reviewRules, setReviewRules] = useState<ReviewRule[]>([]);
  const [isLoadingRules, setIsLoadingRules] = useState(false);
  const [isSavingRules, setIsSavingRules] = useState(false);
  const [editingRules, setEditingRules] = useState<ReviewRule[]>([]);
  
  // 单词学习页面相关状态
  const [selectedDateTime, setSelectedDateTime] = useState<string>(() => {
    // 设置为2026年4月20日早上8点
    return '2026-04-20T08:00:00';
  });
  const [studyWords, setStudyWords] = useState<any[]>([]);
  const [isLoadingStudyWords, setIsLoadingStudyWords] = useState(false);
  const [updatingWords, setUpdatingWords] = useState<Set<string>>(new Set());

  // 运行时间累加器状态
  const [runningSeconds, setRunningSeconds] = useState(0);
  const [projectStartTime, setProjectStartTime] = useState<number | null>(null);

  // 获取项目启动时间并计算运行时间
  const fetchUptime = async () => {
    try {
      const response = await fetch('/api/uptime');
      const data = await response.json();
      
      if (data.success) {
        setProjectStartTime(data.startTime);
        setRunningSeconds(data.uptimeSeconds);
      }
    } catch (error) {
      console.error('获取运行时间失败:', error);
    }
  };

  // 运行时间累加器 useEffect
  useEffect(() => {
    // 首次加载时获取项目启动时间
    fetchUptime();
    
    // 每秒更新运行时间
    const interval = setInterval(() => {
      if (projectStartTime) {
        const currentTime = Date.now();
        const uptimeSeconds = Math.floor((currentTime - projectStartTime) / 1000);
        setRunningSeconds(uptimeSeconds);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [projectStartTime]);

  // 格式化运行时间显示
  const formatRunningTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}小时 ${minutes}分钟 ${secs}秒`;
    } else if (minutes > 0) {
      return `${minutes}分钟 ${secs}秒`;
    } else {
      return `${secs}秒`;
    }
  };

  // 字段中文映射
  const fieldLabels: { [key: string]: string } = {
    word: '单词',
    common_meanings: '常用释义',
    uncommon_meanings: '不常用释义',
    english_examples: '英文例句',
    synonyms: '近义词',
    antonyms: '反义词',
    derivatives: '派生词',
    prefixes: '前缀',
    roots: '词根',
    collocations: '词组搭配',
    confusing_words: '易混淆词',
    confusable_words: '易混淆词',
    context: '语境',
    importance_level: '重要等级',
    memory_aid: '记忆技巧'
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setResult(null);
      setShowTable(false);
      setParsedWords([]);
      setSelectedWords(new Set());
    }
  };

  // 处理单个复选框选择
  const handleWordSelect = (index: number) => {
    const newSelected = new Set(selectedWords);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedWords(newSelected);
  };

  // 处理全选/取消全选
  const handleSelectAll = () => {
    if (selectedWords.size === parsedWords.length) {
      setSelectedWords(new Set());
    } else {
      setSelectedWords(new Set(parsedWords.map((_, index) => index)));
    }
  };

  // 导入选中的单词
  const confirmImportSelected = async () => {
    if (selectedWords.size === 0) {
      alert('请至少选择一个单词');
      return;
    }

    setIsConfirming(true);

    try {
      const selectedWordsData = parsedWords.filter((_, index) => selectedWords.has(index));

      const response = await fetch('/api/confirm-import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          wordsData: selectedWordsData,
          overwriteDuplicates: true // 选中导入时允许覆盖
        }),
      });

      const data = await response.json();
      setResult(data);
      setShowTable(false);

      if (response.ok) {
        setFile(null);
        setParsedWords([]);
        setSelectedWords(new Set());
        // 重置文件输入
        const fileInput = document.getElementById('csvFile') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
      }
    } catch (error) {
      setResult({
        error: '确认导入失败',
        details: error instanceof Error ? error.message : '未知错误'
      });
    } finally {
      setIsConfirming(false);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      alert('请选择CSV文件');
      return;
    }

    setIsUploading(true);
    setResult(null);
    setShowTable(false);

    try {
      const formData = new FormData();
      formData.append('file', file);

      console.log('开始上传文件:', file.name);

      const response = await fetch('/api/import-words', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      console.log('API响应:', data);
      console.log('响应状态:', response.ok);

      if (response.ok) {
        setResult(data);
        setParsedWords(data.parsedWords || []);
        console.log('设置parsedWords:', data.parsedWords?.length);
        setShowTable(true);
        console.log('设置showTable为true');
      } else {
        setResult(data);
        console.log('API错误:', data);
      }
    } catch (error) {
      console.error('请求失败:', error);
      setResult({
        error: '上传失败',
        details: error instanceof Error ? error.message : '未知错误'
      });
    } finally {
      setIsUploading(false);
    }
  };

  const confirmImport = async (overwriteDuplicates: boolean) => {
    setIsConfirming(true);

    try {
      let wordsToImport = parsedWords;

      // 如果不覆盖重复单词，过滤掉重复的
      if (!overwriteDuplicates) {
        wordsToImport = parsedWords.filter(word => !word.isDuplicate);
      }

      const response = await fetch('/api/confirm-import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          wordsData: wordsToImport,
          overwriteDuplicates
        }),
      });

      const data = await response.json();
      setResult(data);
      setShowTable(false);

      if (response.ok) {
        setFile(null);
        setParsedWords([]);
        // 重置文件输入
        const fileInput = document.getElementById('csvFile') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
      }
    } catch (error) {
      setResult({
        error: '确认导入失败',
        details: error instanceof Error ? error.message : '未知错误'
      });
    } finally {
      setIsConfirming(false);
    }
  };

  // 加载复习规则
  const loadReviewRules = async () => {
    setIsLoadingRules(true);
    try {
      const response = await fetch('/api/review-rules');
      const data = await response.json();
      
      if (response.ok && data.success) {
        setReviewRules(data.data);
        setEditingRules(JSON.parse(JSON.stringify(data.data))); // 深拷贝
      } else {
        setResult({
          error: '加载复习规则失败',
          details: data.error || '未知错误'
        });
      }
    } catch (error) {
      setResult({
        error: '加载复习规则失败',
        details: error instanceof Error ? error.message : '未知错误'
      });
    } finally {
      setIsLoadingRules(false);
    }
  };

  // 保存复习规则
  const saveReviewRules = async () => {
    setIsSavingRules(true);
    try {
      const response = await fetch('/api/review-rules', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ rules: editingRules }),
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        setReviewRules(JSON.parse(JSON.stringify(editingRules))); // 深拷贝
        setResult({
          message: '复习规则保存成功',
          successCount: editingRules.length
        });
      } else {
        setResult({
          error: '保存复习规则失败',
          details: data.error || '未知错误'
        });
      }
    } catch (error) {
      setResult({
        error: '保存复习规则失败',
        details: error instanceof Error ? error.message : '未知错误'
      });
    } finally {
      setIsSavingRules(false);
    }
  };

  // 更新编辑中的规则
  const updateEditingRule = (index: number, field: keyof ReviewRule, value: string | number) => {
    const newRules = [...editingRules];
    newRules[index] = { ...newRules[index], [field]: value };
    setEditingRules(newRules);
  };

  // 重置编辑
  const resetEditing = () => {
    setEditingRules(JSON.parse(JSON.stringify(reviewRules)));
  };

  // 获取需要学习的单词
  const loadStudyWords = async (dateTime: string) => {
    setIsLoadingStudyWords(true);
    try {
      console.log('发送的时间:', dateTime);
      
      // 确保时间格式正确
      const formattedDateTime = new Date(dateTime).toISOString();
      console.log('格式化后的时间:', formattedDateTime);
      
      const response = await fetch('/api/study-words', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ currentTime: formattedDateTime }),
      });

      const data = await response.json();
      console.log('API响应:', data);
      
      if (response.ok && data.success) {
        setStudyWords(data.data);
      } else {
        console.error('API错误:', data);
        setResult({
          error: '获取学习单词失败',
          details: data.error || data.details || '未知错误'
        });
        setStudyWords([]);
      }
    } catch (error) {
      console.error('请求失败:', error);
      setResult({
        error: '获取学习单词失败',
        details: error instanceof Error ? error.message : '未知错误'
      });
      setStudyWords([]);
    } finally {
      setIsLoadingStudyWords(false);
    }
  };

  // 处理时间变化
  const handleDateTimeChange = (newDateTime: string) => {
    setSelectedDateTime(newDateTime);
    loadStudyWords(newDateTime);
  };

  // 更新单词状态为已掌握
  const markWordAsCompleted = async (word: string, stage: string) => {
    const wordKey = `${word}-${stage}`;
    setUpdatingWords(prev => new Set(prev).add(wordKey));
    
    try {
      console.log(`标记单词为已掌握: ${word}, 阶段: ${stage}`);
      
      const response = await fetch('/api/update-word-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ word, stage }),
      });

      const data = await response.json();
      console.log('更新状态响应:', data);
      
      if (response.ok && data.success) {
        // 从学习列表中移除该单词
        setStudyWords(prev => prev.filter(w => !(w.word === word && w.currentStage === stage)));
        
        setResult({
          message: `单词 "${word}" 的阶段 ${stage} 已标记为已完成`,
          successCount: 1
        });
        
        // 3秒后清除成功消息
        setTimeout(() => {
          setResult(null);
        }, 3000);
      } else {
        console.error('更新状态失败:', data);
        setResult({
          error: '标记单词状态失败',
          details: data.error || data.details || '未知错误'
        });
      }
    } catch (error) {
      console.error('请求失败:', error);
      setResult({
        error: '标记单词状态失败',
        details: error instanceof Error ? error.message : '未知错误'
      });
    } finally {
      setUpdatingWords(prev => {
        const newSet = new Set(prev);
        newSet.delete(wordKey);
        return newSet;
      });
    }
  };

  // 安全解析 JSON 字段
  const safeParseJson = (value: any) => {
    if (!value) return null;
    if (typeof value === 'object') return value;
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch (e) {
        console.error('JSON解析失败:', value, e);
        return null;
      }
    }
    return null;
  };

  const formatJsonField = (value: any, fieldName: string) => {
    if (!value) return '-';
    
    // 如果不是JSON字段，直接返回字符串
    if (!['common_meanings', 'uncommon_meanings', 'english_examples', 'synonyms', 'antonyms', 'derivatives', 'prefixes', 'roots', 'collocations', 'confusing_words', 'confusable_words', 'context'].includes(fieldName)) {
      return String(value);
    }

    // 处理不同类型的JSON字段
    try {
      switch (fieldName) {
        case 'common_meanings':
        case 'uncommon_meanings':
          // 格式: {"adj.": ["值得注意的", "非凡的"], "n.": ["名词释义"]}
          if (typeof value === 'object') {
            return Object.entries(value).map(([pos, meanings]) => 
              `${pos} ${Array.isArray(meanings) ? meanings.join(', ') : meanings}`
            ).join('; ');
          }
          break;

        case 'english_examples':
          // 格式: [{"en": "英文例句", "cn": "中文释义"}]
          if (Array.isArray(value)) {
            return value.map((example: any, index: number) => 
              `${index + 1}. ${example.en || ''} (${example.cn || ''})`
            ).join(' | ');
          }
          break;

        case 'synonyms':
        case 'antonyms':
          // 格式: [{"word": "单词", "meaning": "释义"}]
          if (Array.isArray(value)) {
            return value.map((item: any) => 
              `${item.word || ''}(${item.meaning || ''})`
            ).join(', ');
          }
          break;

        case 'derivatives':
          // 格式: [{"word": "派生词", "meaning": "释义", "type": "词性"}]
          if (Array.isArray(value)) {
            return value.map((item: any) => 
              `${item.word || ''}(${item.type || ''}) ${item.meaning || ''}`
            ).join(', ');
          }
          break;

        case 'prefixes':
        case 'roots':
          // 格式: [{"prefix/root": "前缀/词根", "meaning": "含义"}]
          if (Array.isArray(value)) {
            return value.map((item: any) => {
              const key = item.prefix || item.root || '';
              return `${key}: ${item.meaning || ''}`;
            }).join(', ');
          }
          break;

        case 'collocations':
          // 格式: [{"phrase": "词组", "meaning": "释义"}]
          if (Array.isArray(value)) {
            return value.map((item: any) => 
              `${item.phrase || ''}(${item.meaning || ''})`
            ).join(', ');
          }
          break;

        case 'confusing_words':
        case 'confusable_words':
          // 格式: [{"word": "finite","pos": "adj.","cn": "有限的，有界限的"}]
          if (Array.isArray(value)) {
            return value.map((item: any) => 
              `${item.word || ''}(${item.pos || ''}) ${item.cn || ''}`
            ).join(', ');
          }
          break;

        case 'context':
          // 格式: [{"situation": "考研阅读", "example": "The company is in desperate need of reform.", "translation": "公司迫切需要改革。"}]
          if (Array.isArray(value)) {
            return value.map((item: any, index: number) => 
              `${index + 1}. [${item.situation || ''}] ${item.example || ''} (${item.translation || ''})`
            ).join(' | ');
          }
          break;

        default:
          return JSON.stringify(value);
      }
    } catch (e) {
      console.error('格式化JSON字段失败:', fieldName, value, e);
    }

    // 如果解析失败，返回原始JSON字符串（截断）
    const jsonStr = JSON.stringify(value);
    return jsonStr.length > 100 ? jsonStr.substring(0, 100) + '...' : jsonStr;
  };

  // 渲染不同页面的内容
  const renderPageContent = () => {
    switch (currentPage) {
      case 'import':
        return (
          <>
            <h1 className="text-3xl font-bold text-gray-800 mb-8">单词导入系统</h1>
            
            <div className="space-y-4 mb-6">
              <div>
                <label htmlFor="csvFile" className="block text-sm font-medium text-gray-700 mb-2">
                  选择CSV文件
                </label>
                <input
                  id="csvFile"
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>

              {file && (
                <div className="text-sm text-gray-600">
                  已选择文件: {file.name} ({(file.size / 1024).toFixed(2)} KB)
                </div>
              )}

              <button
                onClick={handleUpload}
                disabled={!file || isUploading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isUploading ? '解析中...' : '解析文件'}
              </button>
            </div>

            {/* 数据表格 */}
            {showTable && parsedWords.length > 0 && (
              <div className="mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold text-gray-800">
                    解析结果 (共 {parsedWords.length} 个单词)
                  </h3>
                  {result?.duplicateCount > 0 && (
                    <div className="text-orange-600 font-medium">
                      发现 {result.duplicateCount} 个重复单词
                    </div>
                  )}
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full bg-white">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">
                          <input
                            type="checkbox"
                            checked={selectedWords.size === parsedWords.length && parsedWords.length > 0}
                            onChange={handleSelectAll}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">
                          行号
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                          状态
                        </th>
                        {Object.entries(fieldLabels).map(([key, label]) => (
                          <th key={key} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {label}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {parsedWords.map((word, index) => (
                        <tr key={index} className={word.isDuplicate ? 'bg-red-50' : ''}>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                            <input
                              type="checkbox"
                              checked={selectedWords.has(index)}
                              onChange={() => handleWordSelect(index)}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                            {word.rowNumber}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm">
                            {word.isDuplicate ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                重复
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                新增
                              </span>
                            )}
                          </td>
                          {Object.keys(fieldLabels).map((key) => (
                            <td key={key} className="px-4 py-4 text-sm text-gray-900">
                              <div className="break-words" title={formatJsonField(word[key as keyof ParsedWord], key)}>
                                {key === 'word' ? (
                                  <span className={word.isDuplicate ? 'font-bold text-red-600' : 'font-medium'}>
                                    {word[key as keyof ParsedWord] as string}
                                  </span>
                                ) : (
                                  formatJsonField(word[key as keyof ParsedWord], key)
                                )}
                              </div>
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* 选择状态显示 */}
                {selectedWords.size > 0 && (
                  <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-blue-800 font-medium">
                      已选择 {selectedWords.size} 个单词
                    </p>
                  </div>
                )}

                {/* 确认导入按钮 */}
                <div className="mt-6 flex gap-4">
                  {/* 仅导入选中按钮 */}
                  <button
                    onClick={confirmImportSelected}
                    disabled={isConfirming || selectedWords.size === 0}
                    className="flex-1 bg-purple-600 text-white py-3 px-6 rounded-lg hover:bg-purple-700 disabled:bg-gray-400"
                  >
                    {isConfirming ? '导入中...' : `仅导入选中 (${selectedWords.size} 个)`}
                  </button>

                  {result?.duplicateCount > 0 ? (
                    <>
                      <button
                        onClick={() => confirmImport(false)}
                        disabled={isConfirming}
                        className="flex-1 bg-gray-600 text-white py-3 px-6 rounded-lg hover:bg-gray-700 disabled:bg-gray-400"
                      >
                        {isConfirming ? '导入中...' : `只导入新单词 (${parsedWords.filter(w => !w.isDuplicate).length} 个)`}
                      </button>
                      <button
                        onClick={() => confirmImport(true)}
                        disabled={isConfirming}
                        className="flex-1 bg-orange-600 text-white py-3 px-6 rounded-lg hover:bg-orange-700 disabled:bg-gray-400"
                      >
                        {isConfirming ? '导入中...' : `导入全部并覆盖重复 (${parsedWords.length} 个)`}
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => confirmImport(false)}
                      disabled={isConfirming}
                      className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 disabled:bg-gray-400"
                    >
                      {isConfirming ? '导入中...' : `确认导入全部 (${parsedWords.length} 个单词)`}
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* 结果显示 */}
            {result && !showTable && (
              <div className="mt-6 p-4 rounded-lg border">
                {result.error ? (
                  <div className="text-red-600">
                    <h3 className="font-semibold">操作失败</h3>
                    <p>{result.error}</p>
                    {result.details && <p className="text-sm mt-1">{result.details}</p>}
                  </div>
                ) : (
                  <div className="text-green-600">
                    <h3 className="font-semibold">{result.message}</h3>
                    {result.successCount !== undefined && (
                      <p>成功导入: {result.successCount} 条</p>
                    )}
                    {result.errorCount > 0 && (
                      <div className="mt-2">
                        <p className="text-red-600">失败: {result.errorCount} 条</p>
                        {result.errors && result.errors.length > 0 && (
                          <div className="mt-2">
                            <p className="text-sm font-medium">错误详情:</p>
                            <ul className="text-sm text-red-600 list-disc list-inside">
                              {result.errors.map((error: string, index: number) => (
                                <li key={index}>{error}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </>
        );

      case 'curve':
        // 当切换到遗忘曲线页面时，自动加载数据
        if (reviewRules.length === 0 && !isLoadingRules) {
          loadReviewRules();
        }
        
        return (
          <>
            <h1 className="text-3xl font-bold text-gray-800 mb-8">遗忘曲线设置</h1>
            
            <div className="bg-blue-50 p-6 rounded-lg mb-6">
              <h2 className="text-lg font-semibold mb-2 text-blue-800">复习规则说明</h2>
              <p className="text-blue-700 text-sm">
                根据艾宾浩斯遗忘曲线理论，合理安排单词复习时间可以有效提高记忆效果。
                你可以调整每个阶段的复习时间间隔和时间段。
              </p>
            </div>

            {isLoadingRules ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="mt-2 text-gray-600">加载复习规则中...</p>
              </div>
            ) : (
              <>
                {editingRules.length > 0 && (
                  <div className="bg-white rounded-lg shadow-sm border">
                    <div className="px-6 py-4 border-b border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-800">复习规则配置</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        调整每个复习阶段的时间间隔和复习时间段
                      </p>
                    </div>
                    
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              复习阶段
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              时间间隔 (天)
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              开始时间
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              结束时间
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              说明
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {editingRules.map((rule, index) => (
                            <tr key={rule.rule_name} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-800 text-sm font-medium">
                                    {rule.rule_name}
                                  </span>
                                  <span className="ml-3 text-sm font-medium text-gray-900">
                                    阶段 {rule.rule_name}
                                  </span>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <input
                                  type="number"
                                  min="0"
                                  max="365"
                                  value={rule.offset_days}
                                  onChange={(e) => updateEditingRule(index, 'offset_days', parseInt(e.target.value) || 0)}
                                  className="w-20 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <input
                                  type="time"
                                  step="1"
                                  value={rule.start_time}
                                  onChange={(e) => updateEditingRule(index, 'start_time', e.target.value)}
                                  className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <input
                                  type="time"
                                  step="1"
                                  value={rule.end_time}
                                  onChange={(e) => updateEditingRule(index, 'end_time', e.target.value)}
                                  className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-500">
                                {rule.offset_days === 0 ? '当天复习' : `${rule.offset_days}天后复习`}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    
                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
                      <div className="text-sm text-gray-600">
                        * 规则名称不可修改，时间格式为 HH:MM:SS
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={resetEditing}
                          disabled={isSavingRules}
                          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                        >
                          重置
                        </button>
                        <button
                          onClick={saveReviewRules}
                          disabled={isSavingRules}
                          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                        >
                          {isSavingRules ? '保存中...' : '保存设置'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* 操作结果显示 */}
                {result && currentPage === 'curve' && (
                  <div className="mt-6 p-4 rounded-lg border">
                    {result.error ? (
                      <div className="text-red-600">
                        <h3 className="font-semibold">操作失败</h3>
                        <p>{result.error}</p>
                        {result.details && <p className="text-sm mt-1">{result.details}</p>}
                      </div>
                    ) : (
                      <div className="text-green-600">
                        <h3 className="font-semibold">{result.message}</h3>
                        {result.successCount !== undefined && (
                          <p>成功更新: {result.successCount} 条规则</p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </>
        );

      case 'word':
        // 当切换到单词学习页面时，自动加载数据
        if (studyWords.length === 0 && !isLoadingStudyWords) {
          loadStudyWords(selectedDateTime);
        }
        
        return (
          <>
            <h1 className="text-3xl font-bold text-gray-800 mb-8">单词学习</h1>
            
            {/* 时间选择器 */}
            <div className="bg-white rounded-lg shadow-sm border mb-6">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800">选择学习时间</h3>
                <p className="text-sm text-gray-600 mt-1">
                  选择当前时间来查看需要复习的单词
                </p>
              </div>
              
              <div className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="flex-1">
                    <label htmlFor="datetime" className="block text-sm font-medium text-gray-700 mb-2">
                      当前时间
                    </label>
                    <input
                      id="datetime"
                      type="datetime-local"
                      step="1"
                      value={selectedDateTime}
                      onChange={(e) => handleDateTimeChange(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div className="flex flex-col space-y-2">
                    <button
                      onClick={() => {
                        const now = new Date();
                        const year = now.getFullYear();
                        const month = String(now.getMonth() + 1).padStart(2, '0');
                        const day = String(now.getDate()).padStart(2, '0');
                        const hours = String(now.getHours()).padStart(2, '0');
                        const minutes = String(now.getMinutes()).padStart(2, '0');
                        const seconds = String(now.getSeconds()).padStart(2, '0');
                        const currentTime = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
                        handleDateTimeChange(currentTime);
                      }}
                      className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      设为当前时间
                    </button>
                  </div>
                </div>
                
                {/* 时间显示 */}
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600 mb-2">选择的时间：</div>
                  <div className="text-lg font-mono text-gray-800">
                    {new Date(selectedDateTime).toLocaleString('zh-CN', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                      hour12: false
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* 需要学习的单词 */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">需要记忆的单词</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      根据选择的时间显示需要复习的单词
                    </p>
                  </div>
                  {!isLoadingStudyWords && (
                    <div className="text-sm text-gray-500">
                      共 {studyWords.length} 个单词
                    </div>
                  )}
                </div>
              </div>

              {isLoadingStudyWords ? (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <p className="mt-2 text-gray-600">加载学习单词中...</p>
                </div>
              ) : studyWords.length > 0 ? (
                <div className="divide-y divide-gray-200">
                  {studyWords.map((wordData, index) => (
                    <div key={index} className="p-6 hover:bg-gray-50">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center space-x-3">
                          <h4 className="text-xl font-bold text-gray-900">{wordData.word}</h4>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            wordData.currentStage === 'A' ? 'bg-red-100 text-red-800' :
                            wordData.currentStage === 'B' ? 'bg-orange-100 text-orange-800' :
                            wordData.currentStage === 'C' ? 'bg-yellow-100 text-yellow-800' :
                            wordData.currentStage === 'D' ? 'bg-green-100 text-green-800' :
                            wordData.currentStage === 'E' ? 'bg-blue-100 text-blue-800' :
                            wordData.currentStage === 'F' ? 'bg-indigo-100 text-indigo-800' :
                            'bg-purple-100 text-purple-800'
                          }`}>
                            阶段 {wordData.currentStage}
                          </span>
                          {wordData.importance_level && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              {wordData.importance_level}
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-500">
                          {wordData.stageTimeRange}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* 常用释义 */}
                        {wordData.common_meanings && (
                          <div>
                            <h5 className="text-sm font-medium text-gray-700 mb-2">常用释义</h5>
                            <div className="text-sm text-gray-600">
                              {formatJsonField(safeParseJson(wordData.common_meanings), 'common_meanings')}
                            </div>
                          </div>
                        )}

                        {/* 英文例句 */}
                        {wordData.english_examples && (
                          <div>
                            <h5 className="text-sm font-medium text-gray-700 mb-2">英文例句</h5>
                            <div className="text-sm text-gray-600">
                              {formatJsonField(safeParseJson(wordData.english_examples), 'english_examples')}
                            </div>
                          </div>
                        )}

                        {/* 记忆技巧 */}
                        {wordData.memory_aid && (
                          <div className="md:col-span-2">
                            <h5 className="text-sm font-medium text-gray-700 mb-2">记忆技巧</h5>
                            <div className="text-sm text-gray-600 bg-yellow-50 p-3 rounded-lg">
                              {wordData.memory_aid}
                            </div>
                          </div>
                        )}

                        {/* 语境 */}
                        {wordData.context && (
                          <div className="md:col-span-2">
                            <h5 className="text-sm font-medium text-gray-700 mb-2">语境</h5>
                            <div className="text-sm text-gray-600">
                              {formatJsonField(safeParseJson(wordData.context), 'context')}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* 操作按钮 */}
                      <div className="mt-4 flex justify-end space-x-3">
                        <button 
                          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          onClick={() => {
                            // 跳过功能 - 暂时不实现
                            console.log('跳过单词:', wordData.word);
                          }}
                        >
                          跳过
                        </button>
                        <button 
                          className={`px-4 py-2 text-sm font-medium text-white border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                            updatingWords.has(`${wordData.word}-${wordData.currentStage}`)
                              ? 'bg-gray-400 cursor-not-allowed'
                              : 'bg-green-600 hover:bg-green-700'
                          }`}
                          disabled={updatingWords.has(`${wordData.word}-${wordData.currentStage}`)}
                          onClick={() => markWordAsCompleted(wordData.word, wordData.currentStage)}
                        >
                          {updatingWords.has(`${wordData.word}-${wordData.currentStage}`) ? '处理中...' : '已掌握'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  <p className="text-gray-500 text-lg">当前时间段没有需要复习的单词</p>
                  <p className="text-gray-400 text-sm mt-2">尝试选择其他时间或导入更多单词</p>
                </div>
              )}
            </div>

            {/* 操作结果显示 */}
            {result && currentPage === 'word' && (
              <div className="mt-6 p-4 rounded-lg border">
                {result.error ? (
                  <div className="text-red-600">
                    <h3 className="font-semibold">操作失败</h3>
                    <p>{result.error}</p>
                    {result.details && <p className="text-sm mt-1">{result.details}</p>}
                  </div>
                ) : (
                  <div className="text-green-600">
                    <h3 className="font-semibold">{result.message}</h3>
                  </div>
                )}
              </div>
            )}
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-white p-8 pb-20">
      {/* 顶部运行时间显示器 */}
      <div className="fixed top-0 left-0 right-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg z-50">
        <div className="flex justify-between items-center px-6 py-3">
          <div className="flex items-center space-x-2">
            <svg className="w-5 h-5 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm font-medium">项目运行时间</span>
          </div>
          <div className="text-lg font-bold">
            {formatRunningTime(runningSeconds)}
          </div>
        </div>
      </div>
      
      {/* 主要内容区域，添加顶部间距 */}
      <div className="w-full mx-auto pt-16">
        {renderPageContent()}
      </div>

      {/* 底部导航栏 */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg">
        <div className="flex justify-around items-center py-3 px-4">
          <button 
            onClick={() => setCurrentPage('import')}
            className={`flex flex-col items-center space-y-1 px-4 py-2 rounded-lg transition-colors ${
              currentPage === 'import' 
                ? 'text-blue-600 bg-blue-50' 
                : 'text-gray-500 hover:text-blue-600 hover:bg-blue-50'
            }`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
            </svg>
            <span className="text-sm font-medium">数据导入</span>
          </button>
          
          <button 
            onClick={() => setCurrentPage('curve')}
            className={`flex flex-col items-center space-y-1 px-4 py-2 rounded-lg transition-colors ${
              currentPage === 'curve' 
                ? 'text-blue-600 bg-blue-50' 
                : 'text-gray-500 hover:text-blue-600 hover:bg-blue-50'
            }`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <span className="text-sm font-medium">遗忘曲线</span>
          </button>
          
          <button 
            onClick={() => setCurrentPage('word')}
            className={`flex flex-col items-center space-y-1 px-4 py-2 rounded-lg transition-colors ${
              currentPage === 'word' 
                ? 'text-blue-600 bg-blue-50' 
                : 'text-gray-500 hover:text-blue-600 hover:bg-blue-50'
            }`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <span className="text-sm font-medium">Word</span>
          </button>
        </div>
      </nav>
    </div>
  );
}