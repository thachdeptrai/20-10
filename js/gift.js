// Gift links are self-contained UTF-8 data, not HTML and not a database record.
export const LIMITS = Object.freeze({ to: 40, from: 40, message: 700, note: 120, noteTitle: 50, promise: 160, finalMessage: 160 });
export const THEMES = ['gold', 'rose', 'blue'];
const MAX_ENCODED_LENGTH = 12000;
export const DEFAULT_NOTE_TITLES = Object.freeze(['Một lời cảm ơn', 'Một điều mình nhớ', 'Một điều muốn nói']);
export const DEFAULT_FINAL_MESSAGE = 'Chúc bạn có một ngày thật vui.';
export const SAMPLE = Object.freeze({
  v: 3, to: 'Bạn', from: 'Một người trân trọng bạn', theme: 'gold',
  message: 'Có vài điều bình thường mình ít khi nói ra.\n\nMong hôm nay bạn có một khoảng thời gian thật dễ chịu: ăn món mình thích, nghỉ một chút nếu đang mệt, hoặc đơn giản là làm điều khiến mình thấy thoải mái.\n\nCảm ơn vì những chuyện nhỏ bạn vẫn làm mỗi ngày. Không cần phải lúc nào cũng ổn hay cố gắng thật nhiều.\n\nVậy thôi. Chúc bạn 20/10 vui, và những ngày sau cũng có thêm nhiều chuyện vui.',
  noteTitles: [...DEFAULT_NOTE_TITLES],
  notes: ['Cảm ơn vì những lần bạn lắng nghe, kể cả khi câu chuyện chẳng có gì lớn lao.', 'Có những cuộc trò chuyện rất bình thường, nhưng nghĩ lại vẫn thấy vui.', 'Hy vọng thời gian tới bạn có thêm nhiều chuyện vui và đủ thời gian cho chính mình.'],
  promise: 'Hôm nay, hãy dành một khoảng thời gian thật trọn vẹn cho người bạn thương.',
  finalMessage: DEFAULT_FINAL_MESSAGE,
});
export const NOTE_LABELS = ['CHUYỆN THỨ NHẤT', 'CHUYỆN THỨ HAI', 'CHUYỆN THỨ BA'];
export const NOTE_TEASERS = ['Một chuyện nhỏ nhưng đáng để nói.', 'Có vài điều mình vẫn còn nhớ.', 'Và thêm một điều nữa.'];
export const TEMPLATES = {
  mother: { to: 'Mẹ', from: 'Con', message: 'Mẹ ơi,\n\nCó vài chuyện bình thường con ít khi nói ra. Con biết mẹ vẫn luôn lo rất nhiều thứ, kể cả những việc chẳng ai để ý.\n\nHôm nay con chỉ muốn mẹ nghỉ ngơi một chút, ăn món mẹ thích và đừng bận tâm quá nhiều chuyện. Cảm ơn mẹ vì những điều nhỏ mỗi ngày.\n\nChúc mẹ 20/10 thật vui. Những ngày sau cũng vậy nhé.', noteTitles:['Một lời cảm ơn','Chuyện con vẫn nhớ','Một điều con mong'], notes: ['Cảm ơn mẹ vì những bữa cơm và những lần hỏi con đã về nhà chưa.', 'Con vẫn nhớ cảm giác về nhà, nghe tiếng mẹ và thấy mọi thứ nhẹ đi một chút.', 'Mong mẹ khỏe, vui và có nhiều thời gian dành cho chính mình.'], promise: 'Cuối tuần này, con dành một buổi ở bên mẹ và cùng mẹ ăn món mẹ thích.', finalMessage:'Mẹ nhớ giữ sức khỏe và nghỉ ngơi nhiều hơn nhé.' },
  grandmother: { to: 'Bà', from: 'Cháu', message: 'Bà ơi,\n\nCàng lớn cháu càng thấy quý những chuyện rất bình thường: một câu chuyện bà kể, một lần ngồi cạnh bà, hay một lời hỏi han ngắn thôi.\n\nNgày 20/10, cháu mong bà luôn khỏe, ngủ ngon và có nhiều ngày thật dễ chịu.\n\nCháu sẽ cố gắng dành thêm thời gian để về ngồi với bà nhiều hơn.', noteTitles:['Cảm ơn bà','Một chuyện cháu nhớ','Điều cháu mong'], notes: ['Cảm ơn bà vì những quan tâm rất nhỏ mà cháu luôn mang theo.', 'Cháu nhớ những lần được ngồi cạnh bà, nghe bà kể chuyện ngày trước.', 'Mong bà luôn khỏe, ăn ngon, ngủ yên và cười thật nhiều.'], promise: 'Cháu sẽ gọi cho bà tuần này, dành thời gian nghe bà kể chuyện, không vội vàng.', finalMessage:'Bà cứ khỏe và vui là cháu yên tâm rồi.' },
  sister: { to: 'Chị', from: 'Em', message: 'Có vài điều em không hay nói thẳng.\n\nCảm ơn chị vì những lần nghe em kể chuyện, góp ý lúc cần và vẫn đứng đó khi em hơi rối.\n\nNgày 20/10, mong chị có một ngày nhẹ đầu, làm điều mình thích và gặp toàn chuyện vui.\n\nKhi nào cần người nghe chuyện thì cứ gọi em.', noteTitles:['Cảm ơn chị','Chuyện hai chị em','Thêm một điều'], notes: ['Cảm ơn vì những lần chị đứng về phía em và giúp em nhìn mọi việc rõ hơn.', 'Em vẫn nhớ những lần hai chị em nói mãi không hết chuyện.', 'Mong chị tự tin với điều mình chọn và có nhiều thời gian cho bản thân.'], promise: 'Tuần này, mình hẹn một bữa ăn thật thoải mái và kể nhau nghe dạo này thế nào nhé.', finalMessage:'Chúc chị thời gian tới gặp nhiều chuyện vui hơn.' },
  partner: { to: 'Bạn', from: 'Mình', message: 'Không cần một dịp quá đặc biệt để nói điều này.\n\nMình thích những lúc rất bình thường: kể nhau nghe một ngày chẳng có gì, đi ăn một bữa đơn giản, hay ngồi cạnh nhau mà không cần làm gì nhiều.\n\nCảm ơn vì những điều đó. Hôm nay mong bạn có một ngày thật dễ chịu.\n\nCòn lại để lúc gặp nhau nói tiếp.', noteTitles:['Một lời cảm ơn','Một chuyện mình nhớ','Có điều này'], notes: ['Cảm ơn vì đã cùng mình đi qua cả những ngày vui lẫn những ngày hơi khó.', 'Mình nhớ những lúc ở bên nhau, chẳng cần làm gì đặc biệt mà vẫn thấy vui.', 'Hy vọng mình vẫn có thể nói thật với nhau, kể cả những lúc không ổn.'], promise: 'Mình dành một buổi tối cho nhau, cất điện thoại và đi ăn món bạn thích nhé.', finalMessage:'Vậy thôi. Nhớ giữ sức khỏe nhé.' },
  friend: { to: 'Bạn', from: 'Mình', message: 'Có vài điều bình thường mình ít khi nói ra.\n\nCảm ơn vì những cuộc trò chuyện, những lần nghe nhau than thở và cả những lúc cùng cười vì một chuyện rất nhỏ.\n\nChúc bạn 20/10 vui. Hy vọng thời gian tới có thêm nhiều chuyện thuận lợi và ít phải đau đầu hơn.\n\nKhi nào rảnh mình gặp nhau nhé.', noteTitles:['Cảm ơn nhé','Chuyện vẫn nhớ','Chúc bạn'], notes: ['Cảm ơn vì đã nghe những câu chuyện có đầu mà đôi khi chẳng có cuối của mình.', 'Vẫn nhớ những lần cùng cười vì một chuyện rất nhỏ mà vui cả ngày.', 'Mong bạn sớm chạm tới điều mình đang cố gắng và vẫn có thời gian nghỉ ngơi.'], promise: 'Tuần này mình hẹn một buổi cà phê, để nghe bạn kể dạo này thế nào nhé.', finalMessage:'Hy vọng thời gian tới có nhiều chuyện vui hơn.' },
};
function validText(value, max) {
  return typeof value === 'string' && value.trim().length > 0 && value.length <= max;
}
function validateCore(value) {
  for (const key of ['to','from','message','promise']) {
    if (!validText(value[key], LIMITS[key])) throw new Error('Món quà thiếu nội dung hoặc có nội dung quá dài.');
  }
  if (!Array.isArray(value.notes) || value.notes.length !== 3 || !value.notes.every(note => validText(note,LIMITS.note))) throw new Error('Món quà cần đủ ba điều muốn nói.');
  if (!THEMES.includes(value.theme)) throw new Error('Sắc màu của món quà không hợp lệ.');
}
export function validateGift(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value) || ![2,3].includes(value.v)) throw new Error('Món quà này có định dạng chưa được hỗ trợ.');
  validateCore(value);
  const noteTitles = value.v === 2 ? DEFAULT_NOTE_TITLES : value.noteTitles;
  const finalMessage = value.v === 2 ? DEFAULT_FINAL_MESSAGE : value.finalMessage;
  if (!Array.isArray(noteTitles) || noteTitles.length !== 3 || !noteTitles.every(title => validText(title,LIMITS.noteTitle))) throw new Error('Tiêu đề của ba ngôi sao chưa hợp lệ.');
  if (!validText(finalMessage, LIMITS.finalMessage)) throw new Error('Câu cuối đang trống hoặc quá dài.');
  return {
    v:3,
    to:value.to.trim(),
    from:value.from.trim(),
    message:value.message.trim(),
    noteTitles:noteTitles.map(title=>title.trim()),
    notes:value.notes.map(note=>note.trim()),
    promise:value.promise.trim(),
    finalMessage:finalMessage.trim(),
    theme:value.theme,
  };
}
export function encodeGift(value) {
  const bytes = new TextEncoder().encode(JSON.stringify(validateGift(value)));
  let binary = ''; for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replaceAll('+','-').replaceAll('/','_').replace(/=+$/,'');
}
export function decodeGift(encoded) {
  if (typeof encoded !== 'string' || encoded.length > MAX_ENCODED_LENGTH || !/^[A-Za-z0-9_-]+$/.test(encoded)) throw new Error('Link món quà chưa đầy đủ hoặc không hợp lệ.');
  try {
    const binary = atob(encoded.replaceAll('-','+').replaceAll('_','/'));
    const bytes = Uint8Array.from(binary, char => char.charCodeAt(0));
    return validateGift(JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(bytes)));
  } catch { throw new Error('Chưa mở được món quà. Hãy kiểm tra bạn đã sao chép đầy đủ link.'); }
}
export function giftLink(gift, base = location.href) {
  const url = new URL(base); url.hash = 'gift=' + encodeGift(gift); url.search = ''; return url.href;
}
