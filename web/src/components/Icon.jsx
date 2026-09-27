// Lucide icon by name (same names as the design system). Bundled locally, so it works offline.
import {
  LuRepeat2, LuBellRing, LuChevronRight, LuChevronLeft, LuTriangleAlert, LuCamera, LuListChecks, LuCheck,
  LuCircleCheck, LuSearch, LuX, LuSlidersHorizontal, LuArrowRight, LuPencilLine, LuClock, LuCircleX, LuGavel,
  LuFastForward, LuImage, LuRotateCcw, LuSend, LuSiren, LuCirclePause, LuMic, LuSquare, LuPlay, LuHourglass,
  LuArrowUpRight, LuHouse, LuClipboardList, LuBell, LuThermometer, LuHand, LuNut, LuBug, LuWrench, LuWheat,
  LuTag, LuSprayCan, LuUserPlus, LuShieldCheck, LuStamp, LuFlaskConical, LuTrash2, LuRefreshCcw, LuUsers, LuKeyRound, LuShare, LuSquarePlus, LuEllipsisVertical, LuDownload, LuSmartphone,
  LuMessageCircle, LuImagePlus, LuSendHorizontal, LuMessagesSquare,
} from 'react-icons/lu';

const ICONS = {
  'repeat-2': LuRepeat2, 'bell-ring': LuBellRing, 'chevron-right': LuChevronRight, 'chevron-left': LuChevronLeft,
  'triangle-alert': LuTriangleAlert, camera: LuCamera, 'list-checks': LuListChecks, check: LuCheck,
  'circle-check': LuCircleCheck, search: LuSearch, x: LuX, 'sliders-horizontal': LuSlidersHorizontal,
  'arrow-right': LuArrowRight, 'pencil-line': LuPencilLine, clock: LuClock, 'circle-x': LuCircleX, gavel: LuGavel,
  'fast-forward': LuFastForward, image: LuImage, 'rotate-ccw': LuRotateCcw, send: LuSend, siren: LuSiren,
  'circle-pause': LuCirclePause, mic: LuMic, square: LuSquare, play: LuPlay, hourglass: LuHourglass,
  'arrow-up-right': LuArrowUpRight, house: LuHouse, 'clipboard-list': LuClipboardList, bell: LuBell,
  thermometer: LuThermometer, hand: LuHand, nut: LuNut, bug: LuBug, wrench: LuWrench, wheat: LuWheat, tag: LuTag,
  'spray-can': LuSprayCan, 'user-plus': LuUserPlus, 'shield-check': LuShieldCheck, stamp: LuStamp,
  'flask-conical': LuFlaskConical, 'trash-2': LuTrash2, 'refresh-ccw': LuRefreshCcw, users: LuUsers, 'key-round': LuKeyRound, share: LuShare, 'square-plus': LuSquarePlus, 'ellipsis-vertical': LuEllipsisVertical, download: LuDownload, smartphone: LuSmartphone,
  'message-circle': LuMessageCircle, 'image-plus': LuImagePlus, 'send-horizontal': LuSendHorizontal, 'messages-square': LuMessagesSquare,
};

const ALIAS = { arrow: 'arrow-right', correct: 'circle-check', incorrect: 'circle-x', warning: 'triangle-alert', chevron: 'chevron-right' };

export function Icon({ name, size = 24, color = 'currentColor', strokeWidth = 2, style }) {
  const C = ICONS[ALIAS[name] || name];
  return (
    <span aria-hidden="true" style={{ display: 'inline-flex', flex: 'none', width: size, height: size, color, lineHeight: 0, ...style }}>
      {C ? <C size={size} strokeWidth={strokeWidth} style={{ display: 'block', width: '100%', height: '100%' }} /> : null}
    </span>
  );
}
