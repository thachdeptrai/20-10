// Gift links are self-contained UTF-8 data, not HTML and not a database record.
export const LIMITS = Object.freeze({ to: 40, from: 40, message: 700, note: 120, title: 50, promise: 160, finalMessage: 160 });
export const THEMES = ['gold', 'rose', 'blue'];
const MAX_ENCODED_LENGTH = 12000;
export const SAMPLE = Object.freeze({
  v: 3, to: 'Bạn', from: 'Một người trân trọng bạn', theme: 'gold',
  message: 'Có những ngày, bạn bận chăm chút cho mọi người đến mức quên hỏi mình có đang vui không.\n\nHôm nay, mong bạn có một chút thời gian cho chính mình. Được ăn món mình thích, gặp người khiến mình thoải mái, hoặc đơn giản là nghỉ ngơi mà không thấy áy náy.\n\nCảm ơn vì đã có mặt, vì những cố gắng ít khi được kể ra, và vì vẫn là bạn — rất riêng, rất đáng quý.\n\nChúc bạn một ngày 20/10 dịu dàng. Và những ngày sau đó, cũng vậy.',
  notes: ['Cảm ơn vì những lần bạn lắng nghe, ngay cả khi câu chuyện chẳng có gì lớn lao.', 'Có những cuộc trò chuyện rất bình thường, nhưng nghĩ lại vẫn thấy lòng ấm lên.', 'Mong bạn có thời gian cho những điều mình thích, và đủ bình yên để sống theo cách của mình.'],
  starTitles: ['Một lời cảm ơn', 'Một điều mình nhớ', 'Một điều muốn nói'],
  promise: 'Hôm nay, hãy dành một khoảng thời gian thật trọn vẹn cho người bạn thương.',
  finalMessage: 'Chúc bạn có một ngày thật dễ chịu.',
});
export const DEFAULT_STAR_TITLES = ['Một lời cảm ơn', 'Một điều mình nhớ', 'Một điều muốn nói'];
export const NOTE_TITLES = ['Cảm ơn vì có bạn.', 'Một điều còn nhớ.', 'Mong bạn, luôn vui.'];
export const NOTE_LABELS = ['MỘT LỜI CẢM ƠN', 'MỘT ĐIỀU CÒN NHỚ', 'MỘT LỜI CHÚC RIÊNG'];
export const NOTE_TEASERS = ['Vì những quan tâm chẳng bao giờ ồn ào.', 'Vì có những khoảnh khắc cứ ở lại mãi.', 'Vì bạn xứng đáng với những điều dịu dàng.'];
export const TEMPLATES = {
  mother: { to: 'Mẹ yêu', from: 'Con', message: 'Mẹ ơi,\n\nCon vẫn hay nghĩ có nhiều thời gian để nói lời cảm ơn, rồi lại để dành sang hôm khác. Hôm nay con muốn nói luôn: có mẹ trong cuộc đời là điều con rất biết ơn.\n\nCon mong mẹ khỏe, có thời gian làm điều mẹ thích, và kể cho con nghe cả những lúc mẹ thấy mệt. Mẹ không cần lúc nào cũng lo được hết mọi chuyện đâu.\n\nChúc mẹ ngày 20/10 thật vui. Con thương mẹ, cả những ngày con vụng về chưa nói ra.', notes: ['Cảm ơn mẹ vì những bữa cơm và những lần hỏi con đã về nhà chưa.', 'Con nhớ cảm giác được về nhà, nghe tiếng mẹ và thấy mọi thứ nhẹ đi một chút.', 'Mong mẹ khỏe, vui và có nhiều thời gian dành cho chính mình.'], promise: 'Cuối tuần này, con dành một buổi ở bên mẹ và cùng mẹ ăn món mẹ thích.' },
  grandmother: { to: 'Bà yêu', from: 'Cháu', message: 'Bà ơi,\n\nCó những điều càng lớn cháu càng thấy quý: một câu chuyện bà kể, một lần ngồi cạnh bà, một lời hỏi han rất giản dị.\n\nNgày 20/10, cháu mong bà luôn khỏe, ngủ ngon và có thật nhiều niềm vui. Cháu mong mình có thêm nhiều buổi ngồi nghe bà kể chuyện, chậm thôi cũng được.\n\nCháu thương bà nhiều. Cảm ơn bà vì đã luôn dành cho cháu một góc thật ấm trong lòng.', notes: ['Cảm ơn bà vì những quan tâm rất nhỏ mà cháu luôn mang theo.', 'Cháu nhớ những lần được ngồi cạnh bà, nghe bà kể chuyện ngày trước.', 'Mong bà luôn khỏe, ăn ngon, ngủ yên và cười thật nhiều.'], promise: 'Cháu sẽ gọi cho bà tuần này, dành thời gian nghe bà kể chuyện, không vội vàng.' },
  sister: { to: 'Chị thương', from: 'Em', message: 'Gửi người chị đặc biệt của em,\n\nCảm ơn chị vì những lần lắng nghe, vì những lời góp ý thẳng nhưng thương, và vì vẫn ở đó khi em cần.\n\nNgày 20/10, em mong chị được làm điều mình muốn, có người chia sẻ lúc mệt và luôn thấy những cố gắng của mình có ý nghĩa.\n\nChúc chị thật nhiều niềm vui. Khi cần một người nghe chuyện, chị nhớ em cũng ở đây nhé.', notes: ['Cảm ơn vì những lần chị đứng về phía em và giúp em nhìn mọi việc rõ hơn.', 'Em nhớ những lần hai chị em nói mãi không hết chuyện.', 'Mong chị được yêu thương, tự do lựa chọn và tự tin vào chính mình.'], promise: 'Tuần này, mình hẹn một bữa ăn thật thoải mái và kể nhau nghe dạo này thế nào nhé.' },
  partner: { to: 'Người thương', from: 'Một người thương bạn', message: 'Gửi người làm những ngày bình thường trở nên đáng nhớ,\n\nĐiều mình quý nhất không phải những dịp thật đặc biệt. Là cảm giác được kể bạn nghe một ngày chẳng có gì, cùng ăn một bữa cơm, và biết có người muốn hiểu mình.\n\nCảm ơn vì đã ở đây. Mình mong bạn được vui theo cách của bạn, và được nói thật cả những khi không ổn.\n\nNgày 20/10, mình muốn dành cho bạn nhiều hơn một lời chúc: thời gian, sự lắng nghe và những quan tâm có mặt đúng lúc.', notes: ['Cảm ơn vì đã cùng mình đi qua cả những ngày dễ thương lẫn những ngày hơi khó.', 'Mình nhớ những lúc ở bên nhau, chẳng cần làm gì đặc biệt mà vẫn thấy vui.', 'Mong bạn luôn là chính mình và thấy an tâm khi ở cạnh mình.'], promise: 'Mình dành một buổi tối cho nhau, cất điện thoại và đi ăn món bạn thích nhé.' },
  friend: { to: 'Bạn thương', from: 'Mình', message: 'Gửi người bạn mình rất quý,\n\nKhông phải lúc nào mình cũng giỏi nói những lời tình cảm, nhưng mình thật sự biết ơn vì có bạn trong cuộc đời.\n\nCảm ơn vì những cuộc trò chuyện, những lần nghe nhau than thở, và cả những lần cùng cười vì một chuyện rất nhỏ.\n\nChúc bạn ngày 20/10 vui thật vui. Mong bạn có sức khỏe, có niềm tin vào điều mình chọn, và có người ở bên khi cần. Mình vẫn ở đây nhé.', notes: ['Cảm ơn vì đã nghe những câu chuyện có đầu mà đôi khi chẳng có cuối của mình.', 'Nhớ những lần cùng cười vì một chuyện rất nhỏ, vậy mà vui cả ngày.', 'Mong bạn sớm chạm tới điều mình đang cố gắng, và tận hưởng cả chặng đường.'], promise: 'Tuần này mình hẹn một buổi cà phê, để nghe bạn kể dạo này thế nào nhé.' },
};
function validText(value, max) {
  return typeof value === 'string' && value.trim().length > 0 && value.length <= max;
}
export function validateGift(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value) || ![2,3].includes(value.v)) throw new Error('Món quà này có định dạng chưa được hỗ trợ.');
  for (const key of ['to','from','message','promise']) {
    if (!validText(value[key], LIMITS[key])) throw new Error('Món quà thiếu nội dung hoặc có nội dung quá dài.');
  }
  if (!Array.isArray(value.notes) || value.notes.length !== 3 || !value.notes.every(note => validText(note,LIMITS.note))) throw new Error('Món quà cần đủ ba điều muốn nói.');
  if (!THEMES.includes(value.theme)) throw new Error('Sắc màu của món quà không hợp lệ.');
  const starTitles = value.v === 3 && Array.isArray(value.starTitles) ? value.starTitles : DEFAULT_STAR_TITLES;
  if (starTitles.length !== 3 || !starTitles.every(title => validText(title,LIMITS.title))) throw new Error('Tên ba mục chưa hợp lệ.');
  const finalMessage = value.v === 3 && validText(value.finalMessage,LIMITS.finalMessage) ? value.finalMessage : 'Chúc bạn có một ngày thật dễ chịu.';
  return {v:3,to:value.to.trim(),from:value.from.trim(),message:value.message.trim(),notes:value.notes.map(n=>n.trim()),starTitles:starTitles.map(n=>n.trim()),promise:value.promise.trim(),finalMessage:finalMessage.trim(),theme:value.theme};
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
