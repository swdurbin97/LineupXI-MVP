// Simple toast notification system with undo support
type ToastType = 'success' | 'error' | 'info';

let toastContainer: HTMLDivElement | null = null;

function getContainer(): HTMLDivElement {
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.className = 'fixed top-4 right-4 z-[100] flex flex-col gap-2';
    document.body.appendChild(toastContainer);
  }
  return toastContainer;
}

export function toast(message: string, type: ToastType = 'success') {
  const container = getContainer();

  const toastEl = document.createElement('div');
  toastEl.className = `
    px-4 py-3 rounded-lg shadow-lg text-white text-sm font-medium
    transition-all duration-300 transform translate-x-0
    ${type === 'success' ? 'bg-green-600' : type === 'error' ? 'bg-red-600' : 'bg-blue-600'}
  `;
  toastEl.textContent = message;

  container.appendChild(toastEl);

  setTimeout(() => {
    toastEl.style.transform = 'translateX(400px)';
    toastEl.style.opacity = '0';
    setTimeout(() => {
      container.removeChild(toastEl);
    }, 300);
  }, 3000);
}

export function toastWithUndo(
  message: string,
  onUndo: () => void,
  type: ToastType = 'success'
) {
  const container = getContainer();

  const toastEl = document.createElement('div');
  toastEl.className = `
    px-4 py-3 rounded-lg shadow-lg text-white text-sm font-medium
    transition-all duration-300 transform translate-x-0 flex items-center gap-3
    ${type === 'success' ? 'bg-green-600' : type === 'error' ? 'bg-red-600' : 'bg-blue-600'}
  `;

  const messageSpan = document.createElement('span');
  messageSpan.textContent = message;
  messageSpan.className = 'flex-1';

  const undoButton = document.createElement('button');
  undoButton.textContent = 'Undo';
  undoButton.className = `
    px-2 py-1 bg-white text-gray-900 rounded font-semibold text-xs
    hover:bg-gray-100 transition-colors
  `;
  undoButton.onclick = () => {
    onUndo();
    dismissToast(toastEl, container);
  };

  toastEl.appendChild(messageSpan);
  toastEl.appendChild(undoButton);

  container.appendChild(toastEl);

  const timeoutId = setTimeout(() => {
    dismissToast(toastEl, container);
  }, 5000);

  // Clear timeout if user clicks undo
  undoButton.addEventListener('click', () => {
    clearTimeout(timeoutId);
  }, { once: true });
}

function dismissToast(toastEl: HTMLElement, container: HTMLElement) {
  toastEl.style.transform = 'translateX(400px)';
  toastEl.style.opacity = '0';
  setTimeout(() => {
    if (container.contains(toastEl)) {
      container.removeChild(toastEl);
    }
  }, 300);
}
