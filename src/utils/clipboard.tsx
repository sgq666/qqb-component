import { message } from "antd";

/**
 * 复制文本到剪贴板的工具方法
 * @param text 需要复制的文本
 * @param successMessage 复制成功的提示信息，默认为"复制成功"
 * @param errorMessage 复制失败的提示信息，默认为"复制失败"
 */
export const copyToClipboard = (
  text: string,
  successMessage: string = "复制成功",
  errorMessage: string = "复制失败"
): Promise<boolean> => {
  return new Promise((resolve) => {
    // 检查是否支持 navigator.clipboard
    if (navigator.clipboard && window.isSecureContext) {
      // 使用现代 Clipboard API
      navigator.clipboard
        .writeText(text)
        .then(() => {
          message.success(successMessage);
          resolve(true);
        })
        .catch(() => {
          // 如果现代API失败，尝试降级处理
          fallbackCopyTextToClipboard(text, successMessage, errorMessage, resolve);
        });
    } else {
      // 降级处理：使用 document.execCommand('copy')
      fallbackCopyTextToClipboard(text, successMessage, errorMessage, resolve);
    }
  });
};

/**
 * 降级处理的复制方法
 * @param text 需要复制的文本
 * @param successMessage 复制成功的提示信息
 * @param errorMessage 复制失败的提示信息
 * @param resolve Promise的resolve函数
 */
const fallbackCopyTextToClipboard = (
  text: string,
  successMessage: string,
  errorMessage: string,
  resolve: (value: boolean) => void
): void => {
  const textArea = document.createElement("textarea");
  textArea.value = text;

  // 避免滚动到底部
  textArea.style.top = "0";
  textArea.style.left = "0";
  textArea.style.position = "fixed";
  textArea.style.opacity = "0";

  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();

  try {
    const successful = document.execCommand("copy");
    if (successful) {
      message.success(successMessage);
      resolve(true);
    } else {
      message.error(errorMessage);
      resolve(false);
    }
  } catch (err) {
    message.error(errorMessage);
    console.error("复制失败:", err);
    resolve(false);
  }

  document.body.removeChild(textArea);
};

export default copyToClipboard;