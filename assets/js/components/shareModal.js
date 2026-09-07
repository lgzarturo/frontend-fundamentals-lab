/**
 * Componente modal para compartir Daily OS en redes sociales y mejorar la adopción
 */
import { escapeHtml, html } from "../utils/html.js"

export const DEFAULT_SHARE_URL = "https://task-manager.lgzarturo.com/"
export const DEFAULT_SHARE_TITLE = "Daily OS - Tu Sistema Operativo Personal"
export const DEFAULT_SHARE_TEXT =
  "Organiza tu productividad diaria: tareas, hábitos con rachas, notas en Markdown y finanzas en una sola app moderna y 100% privada. 🚀"

/**
 * Plantilla del modal para compartir
 * @param {Object} [i18n=null]
 * @param {Object} [options={}]
 * @returns {string} HTML string
 */
export function shareModalTemplate(i18n = null, options = {}) {
  const url = options.url || DEFAULT_SHARE_URL
  const title =
    options.title ||
    i18n?.getMessage("ui.common.shareTitle") ||
    DEFAULT_SHARE_TITLE
  const text =
    options.text ||
    i18n?.getMessage("ui.common.shareDescription") ||
    DEFAULT_SHARE_TEXT

  const shareLabel = i18n?.getMessage("ui.common.share") || "Compartir"
  const copyLabel = i18n?.getMessage("ui.common.shareCopy") || "Copiar enlace"
  const closeLabel = i18n?.getMessage("ui.common.close") || "Cerrar"
  const nativeShareLabel =
    i18n?.getMessage("ui.common.shareNative") || "Compartir en el dispositivo"

  return html`
    <div class="p-6 max-w-lg mx-auto share-modal-content">
      <div
        class="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-xp-primary/20 mb-4"
      >
        <div class="flex items-center gap-2">
          <span class="text-2xl">🚀</span>
          <h3 class="text-xl font-bold text-gray-900 dark:text-gray-100">
            ${title}
          </h3>
        </div>
        <button
          type="button"
          data-action="close-modal"
          class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-xl font-bold p-1 rounded transition-colors"
          aria-label="${closeLabel}"
        >
          ✕
        </button>
      </div>

      <!-- Preview de la tarjeta Open Graph -->
      <div
        class="rounded-xl overflow-hidden border border-gray-200 dark:border-xp-primary/20 bg-gray-50 dark:bg-xp-darker mb-5 shadow-sm"
      >
        <img
          src="/assets/images/og-daily-os.jpg"
          alt="Daily OS Preview"
          class="w-full h-44 object-cover"
          loading="lazy"
        />
        <div class="p-3.5">
          <div
            class="text-xs font-semibold text-xp-primary uppercase tracking-wider mb-1"
          >
            task-manager.lgzarturo.com
          </div>
          <h4
            class="font-bold text-sm text-gray-900 dark:text-gray-100 mb-1 line-clamp-1"
          >
            Daily OS - Tu Sistema Operativo Personal
          </h4>
          <p class="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
            ${text}
          </p>
        </div>
      </div>

      <!-- Botones de redes sociales -->
      <div class="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mb-5">
        <button
          type="button"
          data-share-platform="twitter"
          class="flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-black text-white hover:bg-gray-800 transition-colors text-xs font-semibold shadow-sm"
        >
          <span class="text-sm">𝕏</span> Twitter / X
        </button>

        <button
          type="button"
          data-share-platform="whatsapp"
          class="flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-[#25D366] text-white hover:bg-[#20ba59] transition-colors text-xs font-semibold shadow-sm"
        >
          <span class="text-sm">💬</span> WhatsApp
        </button>

        <button
          type="button"
          data-share-platform="linkedin"
          class="flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-[#0A66C2] text-white hover:bg-[#095196] transition-colors text-xs font-semibold shadow-sm"
        >
          <span class="text-sm">💼</span> LinkedIn
        </button>

        <button
          type="button"
          data-share-platform="telegram"
          class="flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-[#229ED9] text-white hover:bg-[#1f8ec4] transition-colors text-xs font-semibold shadow-sm"
        >
          <span class="text-sm">✈️</span> Telegram
        </button>

        <button
          type="button"
          data-share-platform="facebook"
          class="flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-[#1877F2] text-white hover:bg-[#166fe5] transition-colors text-xs font-semibold shadow-sm"
        >
          <span class="text-sm">📘</span> Facebook
        </button>

        <button
          type="button"
          data-share-platform="native"
          class="flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-xp-primary text-xp-darker hover:bg-xp-primary/80 transition-colors text-xs font-bold shadow-sm"
        >
          <span class="text-sm">📲</span> ${shareLabel}
        </button>
      </div>

      <!-- Copiar enlace directo -->
      <div class="space-y-1.5">
        <label
          class="block text-xs font-semibold text-gray-700 dark:text-gray-300"
        >
          ${copyLabel}
        </label>
        <div class="flex items-center gap-2">
          <input
            type="text"
            readonly
            value="${escapeHtml(url)}"
            id="share-link-input"
            class="flex-1 px-3 py-2 text-xs rounded-lg border-2 border-gray-200 dark:border-xp-primary/20 bg-white dark:bg-xp-darker text-gray-700 dark:text-gray-300 font-mono select-all focus:outline-none focus:border-xp-primary"
          />
          <button
            type="button"
            data-share-action="copy"
            class="px-4 py-2 bg-xp-primary text-xp-darker text-xs font-bold rounded-lg hover:bg-xp-primary/80 transition-colors shrink-0 flex items-center gap-1.5 shadow-sm"
          >
            <span>📋</span> ${copyLabel}
          </button>
        </div>
      </div>
    </div>
  `
}

/**
 * Enlaza los eventos interactivos del modal de compartir
 * @param {HTMLElement} modalContainer
 * @param {Object} eventBus
 * @param {Object} [i18n=null]
 * @param {Object} [options={}]
 */
export function bindShareModalEvents(
  modalContainer,
  eventBus,
  i18n = null,
  options = {}
) {
  if (!modalContainer) return

  const url = options.url || DEFAULT_SHARE_URL
  const title = options.title || DEFAULT_SHARE_TITLE
  const text = options.text || DEFAULT_SHARE_TEXT

  const handleShareClick = async e => {
    const copyBtn = e.target.closest('[data-share-action="copy"]')
    if (copyBtn) {
      e.preventDefault()
      try {
        if (navigator.clipboard?.writeText) {
          await navigator.clipboard.writeText(url)
        } else {
          const input = modalContainer.querySelector("#share-link-input")
          if (input) {
            input.select()
            document.execCommand("copy")
          }
        }
        const copiedMsg =
          i18n?.getMessage("ui.common.shareCopied") ||
          "¡Enlace copiado al portapapeles! 📋"
        eventBus?.emit("toast:show", { message: copiedMsg, type: "success" })
        eventBus?.emit("share:action", { platform: "copy_link", url })
      } catch {
        eventBus?.emit("toast:show", {
          message: url,
          type: "info"
        })
      }
      return
    }

    const platformBtn = e.target.closest("[data-share-platform]")
    if (!platformBtn) return

    e.preventDefault()
    const platform = platformBtn.dataset.sharePlatform
    eventBus?.emit("share:action", { platform, url })

    switch (platform) {
      case "twitter": {
        const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`
        window.open(
          tweetUrl,
          "_blank",
          "width=600,height=400,noopener,noreferrer"
        )
        break
      }
      case "whatsapp": {
        const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text + " " + url)}`
        window.open(waUrl, "_blank", "noopener,noreferrer")
        break
      }
      case "linkedin": {
        const liUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`
        window.open(liUrl, "_blank", "width=600,height=600,noopener,noreferrer")
        break
      }
      case "telegram": {
        const tgUrl = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`
        window.open(tgUrl, "_blank", "noopener,noreferrer")
        break
      }
      case "facebook": {
        const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`
        window.open(fbUrl, "_blank", "width=600,height=500,noopener,noreferrer")
        break
      }
      case "native": {
        if (navigator.share) {
          navigator.share({ title, text, url }).catch(() => {})
        } else {
          // Fallback a copiar al portapapeles
          if (navigator.clipboard?.writeText) {
            navigator.clipboard.writeText(url)
          }
          const msg =
            i18n?.getMessage("ui.common.shareCopied") ||
            "¡Enlace copiado al portapapeles! 📋"
          eventBus?.emit("toast:show", { message: msg, type: "success" })
        }
        break
      }
    }
  }

  modalContainer.addEventListener("click", handleShareClick)
}
