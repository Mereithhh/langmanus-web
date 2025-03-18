import { EyeInvisibleOutlined, EyeOutlined, SettingOutlined } from "@ant-design/icons";
import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";

import { type ModelSettings, useStore } from "~/core/store";
import { cn } from "~/core/utils";

export function SettingsButton({
  onClick,
}: {
  onClick: () => void;
}) {
  return (
    <button
      className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-gray-100"
      onClick={onClick}
    >
      <SettingOutlined className="text-gray-600" />
    </button>
  );
}

export function SettingsModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const modelSettings = useStore((state) => state.modelSettings);
  const setModelSettings = useStore((state) => state.setModelSettings);
  const [settings, setSettings] = useState<ModelSettings>(modelSettings);
  const [mounted, setMounted] = useState(false);
  const [showReasoningApiKey, setShowReasoningApiKey] = useState(false);
  const [showBasicApiKey, setShowBasicApiKey] = useState(false);
  const [showVlApiKey, setShowVlApiKey] = useState(false);

  // 处理客户端渲染
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // 当store中的设置变化时更新本地状态
  useEffect(() => {
    setSettings(modelSettings);
  }, [modelSettings]);

  const saveSettings = useCallback(() => {
    setModelSettings(settings);
    onClose();
  }, [settings, setModelSettings, onClose]);

  // 阻止事件冒泡
  const stopPropagation = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
  }, []);

  if (!isOpen || !mounted) return null;

  // 使用Portal将模态框渲染到body
  return createPortal(
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
      }}
      onClick={onClose}
    >
      <div
        style={{
          position: 'relative',
          maxHeight: '90vh',
          width: '600px',
          maxWidth: '95vw',
          overflow: 'hidden',
          borderRadius: '0.5rem',
          backgroundColor: 'white',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        }}
        onClick={stopPropagation}
      >
        <div
          style={{
            position: 'sticky',
            top: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '1rem',
            borderBottom: '1px solid #e5e7eb',
            backgroundColor: 'white',
          }}
        >
          <h2 style={{ fontSize: '1.25rem', fontWeight: 500 }}>模型设置</h2>
          <button
            style={{
              display: 'flex',
              height: '2rem',
              width: '2rem',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '9999px',
              color: '#6b7280',
              cursor: 'pointer',
              border: 'none',
              background: 'none',
            }}
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        <div
          style={{
            maxHeight: 'calc(90vh - 120px)',
            overflowY: 'auto',
            padding: '1.5rem',
          }}
        >
          <div style={{ marginBottom: '1.5rem' }}>
            <p style={{ marginBottom: '0.5rem', color: '#6b7280', fontSize: '0.875rem' }}>
              所有配置仅在当前浏览器本地存储，刷新页面不会重置。其他设备或浏览器需要重新配置。
            </p>
            <p style={{ marginBottom: '1rem', color: '#6b7280', fontSize: '0.875rem' }}>
              所有模型配置均使用 OpenAI 兼容接口格式，调用路径为：BaseURL + /chat/completions
            </p>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ marginBottom: '0.5rem', fontSize: '1.125rem', fontWeight: 500 }}>推理大模型</h3>
            <p style={{ marginBottom: '0.75rem', color: '#6b7280', fontSize: '0.875rem' }}>
              用于复杂推理任务，需要较强的思维能力
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#4b5563', marginBottom: '0.25rem' }}>
                  模型名称
                </label>
                <input
                  type="text"
                  style={{
                    width: '100%',
                    padding: '0.5rem 0.75rem',
                    borderRadius: '0.375rem',
                    border: '1px solid #d1d5db',
                  }}
                  value={settings.reasoningModel}
                  onChange={(e) =>
                    setSettings({ ...settings, reasoningModel: e.target.value })
                  }
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#4b5563', marginBottom: '0.25rem' }}>
                  API密钥
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showReasoningApiKey ? "text" : "password"}
                    style={{
                      width: '100%',
                      padding: '0.5rem 0.75rem',
                      paddingRight: '2.5rem',
                      borderRadius: '0.375rem',
                      border: '1px solid #d1d5db',
                    }}
                    value={settings.reasoningApiKey}
                    onChange={(e) =>
                      setSettings({ ...settings, reasoningApiKey: e.target.value })
                    }
                  />
                  <button
                    style={{
                      position: 'absolute',
                      right: '0.5rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#6b7280',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                    onClick={() => setShowReasoningApiKey(prev => !prev)}
                    type="button"
                  >
                    {showReasoningApiKey ? <EyeInvisibleOutlined /> : <EyeOutlined />}
                  </button>
                </div>
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#4b5563', marginBottom: '0.25rem' }}>
                  基础URL
                </label>
                <input
                  type="text"
                  style={{
                    width: '100%',
                    padding: '0.5rem 0.75rem',
                    borderRadius: '0.375rem',
                    border: '1px solid #d1d5db',
                  }}
                  placeholder="例如: https://api.openai.com/v1"
                  value={settings.reasoningBaseUrl}
                  onChange={(e) =>
                    setSettings({ ...settings, reasoningBaseUrl: e.target.value })
                  }
                />
              </div>
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ marginBottom: '0.5rem', fontSize: '1.125rem', fontWeight: 500 }}>基础大模型</h3>
            <p style={{ marginBottom: '0.75rem', color: '#6b7280', fontSize: '0.875rem' }}>
              用于直接回答问题等简单任务，不需要太复杂的推理
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#4b5563', marginBottom: '0.25rem' }}>
                  模型名称
                </label>
                <input
                  type="text"
                  style={{
                    width: '100%',
                    padding: '0.5rem 0.75rem',
                    borderRadius: '0.375rem',
                    border: '1px solid #d1d5db',
                  }}
                  value={settings.basicModel}
                  onChange={(e) =>
                    setSettings({ ...settings, basicModel: e.target.value })
                  }
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#4b5563', marginBottom: '0.25rem' }}>
                  API密钥
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showBasicApiKey ? "text" : "password"}
                    style={{
                      width: '100%',
                      padding: '0.5rem 0.75rem',
                      paddingRight: '2.5rem',
                      borderRadius: '0.375rem',
                      border: '1px solid #d1d5db',
                    }}
                    value={settings.basicApiKey}
                    onChange={(e) =>
                      setSettings({ ...settings, basicApiKey: e.target.value })
                    }
                  />
                  <button
                    style={{
                      position: 'absolute',
                      right: '0.5rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#6b7280',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                    onClick={() => setShowBasicApiKey(prev => !prev)}
                    type="button"
                  >
                    {showBasicApiKey ? <EyeInvisibleOutlined /> : <EyeOutlined />}
                  </button>
                </div>
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#4b5563', marginBottom: '0.25rem' }}>
                  基础URL
                </label>
                <input
                  type="text"
                  style={{
                    width: '100%',
                    padding: '0.5rem 0.75rem',
                    borderRadius: '0.375rem',
                    border: '1px solid #d1d5db',
                  }}
                  placeholder="例如: https://dashscope.aliyuncs.com/compatible-mode/v1"
                  value={settings.basicBaseUrl}
                  onChange={(e) =>
                    setSettings({ ...settings, basicBaseUrl: e.target.value })
                  }
                />
              </div>
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ marginBottom: '0.5rem', fontSize: '1.125rem', fontWeight: 500 }}>视觉语言模型</h3>
            <p style={{ marginBottom: '0.75rem', color: '#6b7280', fontSize: '0.875rem' }}>
              用于处理图像理解相关任务，具备视觉能力
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#4b5563', marginBottom: '0.25rem' }}>
                  模型名称
                </label>
                <input
                  type="text"
                  style={{
                    width: '100%',
                    padding: '0.5rem 0.75rem',
                    borderRadius: '0.375rem',
                    border: '1px solid #d1d5db',
                  }}
                  value={settings.vlModel}
                  onChange={(e) =>
                    setSettings({ ...settings, vlModel: e.target.value })
                  }
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#4b5563', marginBottom: '0.25rem' }}>
                  API密钥
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showVlApiKey ? "text" : "password"}
                    style={{
                      width: '100%',
                      padding: '0.5rem 0.75rem',
                      paddingRight: '2.5rem',
                      borderRadius: '0.375rem',
                      border: '1px solid #d1d5db',
                    }}
                    value={settings.vlApiKey}
                    onChange={(e) =>
                      setSettings({ ...settings, vlApiKey: e.target.value })
                    }
                  />
                  <button
                    style={{
                      position: 'absolute',
                      right: '0.5rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#6b7280',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                    onClick={() => setShowVlApiKey(prev => !prev)}
                    type="button"
                  >
                    {showVlApiKey ? <EyeInvisibleOutlined /> : <EyeOutlined />}
                  </button>
                </div>
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#4b5563', marginBottom: '0.25rem' }}>
                  基础URL
                </label>
                <input
                  type="text"
                  style={{
                    width: '100%',
                    padding: '0.5rem 0.75rem',
                    borderRadius: '0.375rem',
                    border: '1px solid #d1d5db',
                  }}
                  placeholder="例如: https://dashscope.aliyuncs.com/compatible-mode/v1"
                  value={settings.vlBaseUrl}
                  onChange={(e) =>
                    setSettings({ ...settings, vlBaseUrl: e.target.value })
                  }
                />
              </div>
            </div>
          </div>
        </div>

        <div
          style={{
            position: 'sticky',
            bottom: 0,
            display: 'flex',
            justifyContent: 'flex-end',
            padding: '1rem',
            borderTop: '1px solid #e5e7eb',
            backgroundColor: 'white',
          }}
        >
          <button
            style={{
              marginRight: '0.5rem',
              padding: '0.5rem 1rem',
              borderRadius: '0.375rem',
              backgroundColor: '#e5e7eb',
              color: '#4b5563',
              border: 'none',
              cursor: 'pointer',
            }}
            onClick={onClose}
          >
            取消
          </button>
          <button
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '0.375rem',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              cursor: 'pointer',
            }}
            onClick={saveSettings}
          >
            保存
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
