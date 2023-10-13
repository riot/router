import {
  CLICK_EVENT,
  DOWNLOAD_LINK_ATTRIBUTE,
  HREF_LINK_ATTRIBUTE,
  LINK_TAG_NAME,
  RE_ORIGIN,
  TARGET_SELF_LINK_ATTRIBUTE,
  WINDOW_EVENTS,
} from './constants.js'
import { add, remove } from 'bianco.events'
import { defaults, router } from 'rawth'
import { getDocument, getHistory, getLocation, getWindow } from './util.js'
import { has } from 'bianco.attr'

const onWindowEvent = () =>
  router.push(normalizePath(String(getLocation().href)))
const onRouterPush = (path) => {
  const url = path.includes(defaults.base) ? path : defaults.base + path
  const loc = getLocation()
  const hist = getHistory()
  const doc = getDocument()

  // update the browser history only if it's necessary
  if (hist && url !== loc.href) {
    hist.pushState(null, doc.title, url)
  }
}
const getLinkElement = (node) =>
  node && !isLinkNode(node) ? getLinkElement(node.parentNode) : node
const isLinkNode = (node) => node.nodeName === LINK_TAG_NAME
const isCrossOriginLink = (path) =>
  path.indexOf(getLocation().href.match(RE_ORIGIN)[0]) === -1
const isTargetSelfLink = (el) =>
  el.target && el.target !== TARGET_SELF_LINK_ATTRIBUTE
const isEventForbidden = (event) =>
  (event.which && event.which !== 1) || // not left click
  event.metaKey ||
  event.ctrlKey ||
  event.shiftKey || // or meta keys
  event.defaultPrevented // or default prevented
const isForbiddenLink = (el) =>
  !el ||
  !isLinkNode(el) || // not A tag
  has(el, DOWNLOAD_LINK_ATTRIBUTE) || // has download attr
  !has(el, HREF_LINK_ATTRIBUTE) || // has no href attr
  isTargetSelfLink(el) ||
  isCrossOriginLink(el.href)
const normalizePath = (path) => path.replace(defaults.base, '')
const isInBase = (path) => !defaults.base || path.includes(defaults.base)

/**
 * Callback called anytime something will be clicked on the page
 * @param   {HTMLEvent} event - click event
 * @returns {undefined} void method
 */
const onClick = (event) => {
  if (isEventForbidden(event)) return

  const el = getLinkElement(event.target)

  if (isForbiddenLink(el) || !isInBase(el.href)) return

  const path = normalizePath(el.href)

  router.push(path)

  event.preventDefault()
}

/**
 * Link the rawth router to the DOM events
 * @param { HTMLElement } container - DOM node where the links are located
 * @returns {Function} teardown function
 */
export default function initDomListeners(container) {
  const win = getWindow()
  const root = container || getDocument()

  if (win) {
    add(win, WINDOW_EVENTS, onWindowEvent)
    add(root, CLICK_EVENT, onClick)
  }

  router.on.value(onRouterPush)

  return () => {
    if (win) {
      remove(win, WINDOW_EVENTS, onWindowEvent)
      remove(root, CLICK_EVENT, onClick)
    }

    router.off.value(onRouterPush)
  }
}
