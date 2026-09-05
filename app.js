import { firebaseConfig } from './firebase-config.js';
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js';
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js';
import { getFirestore, doc, setDoc, getDoc, arrayUnion } from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js';

const app = initializeApp(firebaseConfig); const auth = getAuth(app); const db = getFirestore(app);
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const state={user:null,saved:new Set(),chart:null,topic:null};

const grades=[
 {id:9,title:'Lớp 9',desc:'Điện học • điện từ • quang học • năng lượng',topics:['Định luật Ôm','Công suất điện','Điện từ','Quang học']},
 {id:10,title:'Lớp 10',desc:'Cơ học nền tảng • động lực học • năng lượng',topics:['Chuyển động','Newton','Công & năng lượng','Động lượng']},
 {id:11,title:'Lớp 11',desc:'TRỌNG TÂM • điện, dao động, sóng, nhiệt',topics:['Dao động','Sóng cơ','Điện trường','Dòng điện']},
 {id:12,title:'Lớp 12',desc:'Điện xoay chiều • quang • hạt nhân • lượng tử',topics:['AC RLC','Quang học','Lượng tử','Hạt nhân']}
];
const laws={
'9':[
 {name:'Định luật Ôm',formula:`I=\\frac{U}{R}`,core:'Với dây dẫn ở điều kiện xác định, I tăng khi U tăng và giảm khi R tăng.',memory:'Nhớ tam giác: U ở trên, I–R ở dưới → I=U/R; che đại lượng cần tìm.',use:'Mạch điện một chiều; kiểm tra đúng điều kiện của dây dẫn.'},
 {name:'Định luật Jun–Lenxơ',formula:`Q=I^2Rt`,core:'Điện năng biến thành nhiệt trong vật dẫn có điện trở.',memory:'Có I, R, t → nghĩ ngay Q=I²Rt.',use:'Bài tỏa nhiệt, dây đốt nóng, bếp điện.'},
 {name:'Định luật phản xạ ánh sáng',formula:`i=r`,core:'Góc tới bằng góc phản xạ; tia tới, tia phản xạ và pháp tuyến cùng nằm trong một mặt phẳng.',memory:'“Tới bao nhiêu → bật lại bấy nhiêu”.',use:'Gương phẳng, xác định góc và hướng tia.'},
 {name:'Định luật bảo toàn năng lượng',formula:`W_{trước}=W_{sau}`,core:'Năng lượng không tự sinh ra hay mất đi; chỉ chuyển hóa hoặc truyền từ hệ này sang hệ khác.',memory:'Thiếu một dạng năng lượng? Tìm nó trong phần “đã chuyển hóa”.',use:'Điện, cơ, nhiệt và các bài hiệu suất.'}
],
'10':[
 {name:'Định luật I Newton',formula:`\\sum\\vec F=0\\Rightarrow\\vec v=\\text{không đổi}`,core:'Nếu hợp lực bằng 0, vật giữ nguyên trạng thái đứng yên hoặc chuyển động thẳng đều.',memory:'“Không hợp lực → không đổi vận tốc”.',use:'Nhận diện cân bằng lực, quán tính.'},
 {name:'Định luật II Newton',formula:`\\sum\\vec F=m\\vec a`,core:'Hợp lực là nguyên nhân làm vận tốc thay đổi; cùng lực thì vật nặng hơn có gia tốc nhỏ hơn.',memory:'F kéo a; m càng lớn → a càng khó đổi.',use:'Bài lực, ma sát, mặt phẳng nghiêng, hệ vật.'},
 {name:'Định luật III Newton',formula:`\\vec F_{AB}=-\\vec F_{BA}`,core:'Hai lực tương tác xuất hiện đồng thời, cùng giá, cùng độ lớn và ngược chiều, tác dụng lên hai vật khác nhau.',memory:'“Tác dụng ↔ phản tác dụng”, đừng cộng chúng vào cùng một vật.',use:'Tương tác hai vật, va chạm, lực căng/phản lực.'},
 {name:'Định luật bảo toàn động lượng',formula:`\\vec p_{trước}=\\vec p_{sau}`,core:'Trong hệ kín, tổng vectơ động lượng không đổi.',memory:'“Trước = sau”, nhưng phải giữ đúng chiều và dấu.',use:'Va chạm, nổ, chuyển động tách vật.'},
 {name:'Định luật bảo toàn cơ năng',formula:`W_đ+W_t=\\text{hằng số}`,core:'Khi chỉ có lực thế thực hiện công (bỏ qua ma sát), tổng động năng và thế năng không đổi.',memory:'Mất động năng thì thế năng tăng tương ứng.',use:'Rơi tự do, con lắc, lò xo lý tưởng.'}
],
'11':[
 {name:'Định luật Coulomb',formula:`F=k\\frac{|q_1q_2|}{r^2}`,core:'Lực tương tác điện tăng theo tích độ lớn điện tích và giảm theo bình phương khoảng cách.',memory:'“Tích ở trên, r² ở dưới”. Tăng r 2 lần → F còn 1/4.',use:'Hai điện tích điểm; nhớ xác định hút hay đẩy.'},
 {name:'Nguyên lý chồng chất điện trường',formula:`\\vec E=\\vec E_1+\\vec E_2+\\cdots`,core:'Điện trường tổng hợp bằng tổng vectơ các điện trường thành phần.',memory:'Không cộng độ lớn bừa; phải cộng vectơ theo phương và chiều.',use:'Nhiều điện tích cùng tạo điện trường.'},
 {name:'Định luật Ôm cho đoạn mạch',formula:`I=\\frac{U}{R}`,core:'Dòng điện qua đoạn mạch phụ thuộc U và R.',memory:'U tăng → I tăng; R tăng → I giảm.',use:'Mạch điện một chiều.'},
 {name:'Định luật Ôm cho toàn mạch',formula:`I=\\frac{\\mathcal E}{R+r}`,core:'Suất điện động cung cấp năng lượng, còn R+r quyết định dòng điện trong mạch kín.',memory:'Toàn mạch = điện trở ngoài R + điện trở trong r.',use:'Nguồn có điện trở trong.'},
 {name:'Định luật Faraday–Lenz',formula:`\\mathcal E_c=-\\frac{\\Delta\\Phi}{\\Delta t}`,core:'Suất điện động cảm ứng xuất hiện khi từ thông qua mạch biến thiên; dấu “−” thể hiện chiều chống lại nguyên nhân gây biến thiên.',memory:'“Có biến thiên từ thông → có cảm ứng”; dấu − = chống lại sự biến thiên.',use:'Cảm ứng điện từ, xác định chiều dòng cảm ứng.'},
 {name:'Định luật Hooke',formula:`F_{dh}=k|\\Delta l|`,core:'Trong giới hạn đàn hồi, lực đàn hồi tỉ lệ với độ biến dạng.',memory:'Kéo/ nén gấp đôi → lực đàn hồi gấp đôi.',use:'Lò xo và dao động điều hòa.'}
],
'12':[
 {name:'Định luật I nhiệt động lực học',formula:`\\Delta U=Q+A`,core:'Độ biến thiên nội năng bằng nhiệt lượng hệ nhận cộng công mà ngoại lực thực hiện lên hệ.',memory:'Hệ nhận nhiệt Q (+), được làm công A (+) → nội năng tăng.',use:'Bài biến đổi trạng thái khí và nhiệt học.'},
 {name:'Định luật Boyle–Mariotte',formula:`pV=\\text{hằng số}`,core:'Với một lượng khí xác định ở nhiệt độ không đổi, áp suất tỉ lệ nghịch với thể tích.',memory:'T tăng? Không áp dụng. Giữ T mới dùng pV=const.',use:'Quá trình đẳng nhiệt.'},
 {name:'Định luật Charles',formula:`\\frac{V}{T}=\\text{hằng số}`,core:'Với lượng khí xác định ở áp suất không đổi, thể tích tỉ lệ thuận nhiệt độ tuyệt đối.',memory:'Nhiệt độ phải đổi sang Kelvin.',use:'Quá trình đẳng áp.'},
 {name:'Định luật Gay-Lussac',formula:`\\frac{p}{T}=\\text{hằng số}`,core:'Với lượng khí xác định ở thể tích không đổi, áp suất tỉ lệ thuận nhiệt độ tuyệt đối.',memory:'Giữ V; T tăng → p tăng.',use:'Quá trình đẳng tích.'},
 {name:'Định luật bảo toàn điện tích',formula:`\\sum q_{trước}=\\sum q_{sau}`,core:'Tổng điện tích của một hệ cô lập không đổi.',memory:'Điện tích không tự mất đi; nó chỉ chuyển từ vật này sang vật khác.',use:'Trao đổi điện tích, điện phân và bài hạt.'},
 {name:'Hệ thức khối lượng–năng lượng',formula:`E=mc^2`,core:'Khối lượng có thể quy đổi tương đương với năng lượng.',memory:'Chỉ cần nhớ c² rất lớn → một độ hụt khối nhỏ tương ứng năng lượng lớn.',use:'Phản ứng hạt nhân, độ hụt khối.'}
]
};

const tips={
'9':['Mạch nối tiếp: I như nhau; mạch song song: U như nhau.','Gương phẳng: ảnh ảo, bằng vật và đối xứng qua gương.','Điện năng = công suất × thời gian: A=Pt.'],
'10':['Vẽ hình + chọn chiều dương trước khi thay số.','Đồ thị v–t: diện tích dưới đồ thị cho độ dịch chuyển; độ dốc cho gia tốc.','Lực vuông góc chuyển dời → công bằng 0.'],
'11':['Dao động điều hòa: v sớm pha π/2 so với x; a ngược pha x.','Mẹo pha: x → v “sớm” π/2 → a “sớm” tiếp π/2. Vì vậy x và a ngược pha π.','Tại biên: v=0, |a| max. Tại cân bằng: |v| max, a=0.','Sóng: cùng pha cách nhau kλ; ngược pha cách nhau (k+1/2)λ.','Giao thoa: cực đại khi Δd=kλ; cực tiểu khi Δd=(k+1/2)λ.','Điện trường: E là “lực trên mỗi coulomb”; V là “thế năng trên mỗi coulomb”.'],
'12':['RLC: ZL tăng theo f; ZC giảm theo f.','Cộng hưởng: ZL=ZC → Z nhỏ nhất, I lớn nhất, cosφ=1.','Quang điện: tăng cường độ không bù được việc f<f0.','Phóng xạ: sau n chu kỳ bán rã, còn 1/2^n số hạt ban đầu.']
};

const topics={
'9':[
topic('Định luật Ôm','Cường độ dòng điện qua đoạn mạch tỉ lệ thuận với hiệu điện thế hai đầu đoạn mạch và tỉ lệ nghịch với điện trở.','I=\\frac{U}{R}','U: V; I: A; R: Ω','Mô hình đoạn mạch Ohm, nhiệt độ và các yếu tố vật lý của dây được coi ổn định.','U tăng 2 lần, R không đổi → I tăng 2 lần.',['Tìm I/U/R','Đoạn mạch','Định luật Ôm']),
topic('Đoạn mạch nối tiếp','Các phần tử mắc nối tiếp có cùng cường độ dòng điện; hiệu điện thế toàn mạch bằng tổng hiệu điện thế thành phần.','R_{td}=R_1+R_2+\\cdots','R: Ω','Chỉ dùng cho cấu trúc nối tiếp.','Điện trở tương đương luôn lớn hơn từng điện trở thành phần.',['Tính Rtd','Chia U','Công suất từng điện trở']),
topic('Đoạn mạch song song','Các nhánh có cùng hiệu điện thế; dòng điện toàn mạch là tổng dòng điện qua các nhánh.','\\frac1{R_{td}}=\\frac1{R_1}+\\frac1{R_2}+\\cdots','R: Ω','Dùng khi các nhánh chung hai nút.','Với hai điện trở: Rtd=R1R2/(R1+R2), nhỏ hơn điện trở nhỏ nhất.',['Tính Rtd','Chia I','Mạch hỗn hợp']),
topic('Công suất điện','Tốc độ tiêu thụ điện năng của thiết bị.','P=UI=I^2R=\\frac{U^2}{R}','P: W','Chọn dạng theo dữ kiện đã biết.','P là tốc độ dùng năng lượng, không phải tổng điện năng.',['Công suất','Điện năng','Tiền điện'])],
'10':[
topic('Tốc độ','Độ nhanh chậm của chuyển động được mô tả bằng quãng đường đi được trong một đơn vị thời gian.','v=\\frac{s}{t}','v: m/s; s: m; t: s','Chuyển động thẳng đều dùng trực tiếp; trường hợp biến đổi cần xét vận tốc tức thời/trung bình.','Đổi km/h ↔ m/s: chia hoặc nhân 3,6.',['Đổi đơn vị','Tốc độ trung bình','Đồ thị s-t']),
topic('Gia tốc','Gia tốc mô tả mức độ thay đổi của vận tốc theo thời gian.','a=\\frac{\\Delta v}{\\Delta t}','m/s²','Với chuyển động biến đổi đều, a không đổi.','a có hướng; không được chỉ nhìn độ lớn rồi bỏ qua chiều.',['Chuyển động biến đổi đều','Đồ thị v-t','Tìm quãng đường']),
topic('Định luật II Newton','Hợp lực quyết định gia tốc của hệ vật.','\\vec F_{hl}=m\\vec a','F: N; m: kg; a: m/s²','Phải xác định hệ và vẽ tất cả lực trước khi chiếu trục.','Nếu cùng lực tác dụng, m tăng 2 lần → a giảm 2 lần.',['Mặt phẳng nghiêng','Ma sát','Hệ vật']),
topic('Công của lực','Công đo năng lượng lực truyền cho vật qua chuyển dời.','A=Fs\\cos\\alpha','J','F và s là độ lớn; α là góc giữa lực và chuyển dời.','Lực vuông góc chuyển dời → công bằng 0.',['Công tổng','Động năng','Công ma sát']),
topic('Động lượng','Động lượng đặc trưng cho trạng thái chuyển động và là đại lượng vectơ.','\\vec p=m\\vec v','kg·m/s','Chọn hệ quy chiếu và chiều dương rõ ràng.','Trong hệ kín, tổng động lượng được bảo toàn.',['Va chạm','Bảo toàn động lượng','Phản lực'])],
'11':[
topic('Dao động điều hòa','Li độ biến thiên theo hàm sin/cos; gia tốc luôn hướng về vị trí cân bằng.','x=A\\cos(\\omega t+\\varphi)','x,A: m; ω: rad/s; t: s','A>0, ω>0; pha phụ thuộc trạng thái ban đầu.','a=-ω²x là dấu hiệu bản chất: a luôn kéo vật về O.',['Viết x(t)','Đọc đồ thị x-t','Tìm pha ban đầu','Tìm thời điểm']),
topic('Chu kỳ và tần số','Chu kỳ là thời gian thực hiện một dao động toàn phần; tần số là số dao động trong một giây.','T=\\frac1f=\\frac{2\\pi}{\\omega}','T: s; f: Hz; ω: rad/s','Dùng đúng đơn vị và quan hệ nghịch đảo.','f tăng → T giảm.',['Tìm T/f/ω','Đếm dao động','Đồ thị']),
topic('Vận tốc và gia tốc dao động','Vận tốc là đạo hàm của li độ; gia tốc là đạo hàm của vận tốc.','v=-\\omega A\\sin(\\omega t+\\varphi),\\quad a=-\\omega^2x','v: m/s; a: m/s²','Biên: v=0, |a|max; cân bằng: |v|max, a=0.','Có thể dùng v²=ω²(A²-x²) khi không cần xác định dấu v.',['Tìm vmax','Tìm a','Biết x tìm v']),
topic('Năng lượng dao động','Nếu không có ma sát, cơ năng không đổi; động năng và thế năng chuyển hóa qua lại.','W=\\frac12kA^2=\\frac12m\\omega^2A^2','J','Mô hình dao động điều hòa lý tưởng.','Ở biên Wt=W, ở O Wđ=W.',['Tỉ số Wđ/Wt','Tìm A','Thời gian chuyển trạng thái']),
topic('Sóng cơ','Sóng cơ là sự lan truyền dao động trong môi trường vật chất, truyền năng lượng chứ không mang vật chất đi theo một cách tổng thể.','v=\\lambda f=\\frac{\\lambda}{T}','v: m/s; λ: m; f: Hz','Cần môi trường truyền sóng.','λ là khoảng cách giữa hai điểm gần nhau dao động cùng pha.',['Tính λ','Độ lệch pha','Giao thoa']),
topic('Điện trường và cường độ điện trường','Điện trường là môi trường vật lý quanh điện tích; cường độ cho biết lực tác dụng lên một điện tích thử dương.','\\vec E=\\frac{\\vec F}{q}','N/C hoặc V/m','q là điện tích thử dương khi xác định chiều E.','Đường sức điện đi ra từ điện tích dương và đi vào điện tích âm.',['Điện trường điểm','Nguyên lý chồng chất','Công của lực điện']),
topic('Dòng điện không đổi','Dòng điện là dòng chuyển dời có hướng của điện tích; cường độ điện biểu thị lượng điện qua tiết diện mỗi giây.','I=\\frac{\\Delta q}{\\Delta t}','A; q: C; t: s','Quy ước chiều dòng điện là chiều chuyển động của điện tích dương.','Trong kim loại electron chuyển động ngược chiều dòng điện quy ước.',['Tính I/q/t','Nguồn điện','Định luật Ohm']),
topic('Ghép nguồn thành bộ','Nguồn ghép nối tiếp làm tăng suất điện động theo tổng đại số; điện trở trong cũng thay đổi theo cách ghép.','E_b=\\sum E_i,\\quad r_b=\\sum r_i','E: V; r: Ω','Phải xét cực cùng chiều hay ngược chiều.','Nguồn song song giống nhau có E_b=E và r_b=r/n.',['Suất điện động','Hiệu suất nguồn','Mạch ngoài'])],
'12':[
topic('RLC nối tiếp','Tổng trở của R, L, C được tạo bởi thành phần thuần trở và hiệu cảm kháng–dung kháng.','Z=\\sqrt{R^2+(Z_L-Z_C)^2}','Ω','Z_L=ωL; Z_C=1/(ωC).','Cộng hưởng khi ZL=ZC → Z=R.',['Cộng hưởng','P, cosφ','Biểu diễn vectơ']),
topic('Công suất điện xoay chiều','Công suất trung bình của mạch AC phụ thuộc điện áp, dòng điện hiệu dụng và hệ số công suất.','P=UI\\cos\\varphi=I^2R','W','U, I là giá trị hiệu dụng.','Chỉ phần công suất tác dụng trên R thực sự tiêu thụ trung bình.',['cosφ','RLC','Truyền tải điện']),
topic('Sóng điện từ','Điện trường và từ trường biến thiên lan truyền trong không gian, không cần môi trường vật chất.','c=\\lambda f','c≈3\\times10^8 m/s trong chân không','Trong chân không các sóng điện từ truyền cùng tốc độ.','Tần số càng lớn → bước sóng càng ngắn.',['Phổ điện từ','Bước sóng','Ứng dụng']),
topic('Lượng tử ánh sáng','Ánh sáng trao đổi năng lượng theo từng lượng tử photon có năng lượng phụ thuộc tần số.','E=hf=\\frac{hc}{\\lambda}','J','h là hằng số Planck.','Photon tần số cao mang năng lượng lớn hơn.',['Quang điện','Photon','Giới hạn quang điện']),
topic('Quang điện ngoài','Electron có thể bật khỏi kim loại nếu photon có năng lượng đủ lớn để thắng công thoát.','hf=A+W_{đ\\,max}','J','f≥f0. Với f<f0 thì không xảy ra quang điện ngoài dù tăng cường độ.','Tăng cường độ chủ yếu làm tăng số electron quang điện, không thay thế điều kiện tần số.',['Hiệu điện thế hãm','f0','Công thoát']),
topic('Phóng xạ','Hạt nhân không bền tự biến đổi thành hạt nhân khác và phát bức xạ.','N=N_0 2^{-t/T_{1/2}}','N không có đơn vị; T1/2: s','Quá trình ngẫu nhiên ở từng hạt nhân nhưng tuân quy luật thống kê.','Sau mỗi chu kỳ bán rã, số hạt chưa phân rã còn một nửa.',['Độ phóng xạ','Chu kỳ bán rã','Bảo toàn'])]
};
function topic(name,essence,formula,units,condition,insight,types){return{name,essence,formula,units,condition,insight,types}}

const graphLibrary=[
{id:'g9-ohm',grade:'9',area:'Điện học',name:'Vôn – Ampe của điện trở',x:'U (V)',y:'I (A)',formula:'I=U/R',shape:'Đường thẳng qua O',slope:'k=1/R',areaMeaning:'Không có ý nghĩa diện tích chuẩn trong bài cơ bản.',points:'O(0,0). Độ dốc càng lớn → R càng nhỏ.',memory:'I trên – U dưới → dốc = 1/R.'},
{id:'g9-power-u',grade:'9',area:'Điện học',name:'Công suất – hiệu điện thế',x:'U (V)',y:'P (W)',formula:'P=U²/R',shape:'Parabol',slope:'Độ dốc thay đổi theo U; không phải hằng số.',areaMeaning:'Không dùng diện tích để đọc đại lượng trong chương trình cơ bản.',points:'O là trạng thái U=0 → P=0.',memory:'U ×2 → P ×4 (R không đổi).'},
{id:'g9-energy-t',grade:'9',area:'Điện học',name:'Điện năng – thời gian',x:'t (s hoặc h)',y:'A (J hoặc kWh)',formula:'A=Pt',shape:'Đường thẳng',slope:'k=P',areaMeaning:'Không dùng diện tích; chính độ dốc cho công suất.',points:'A=0 tại t=0.',memory:'A tăng đều theo t nếu P không đổi.'},
{id:'g10-x-t',grade:'10',area:'Cơ học',name:'Tọa độ – thời gian',x:'t (s)',y:'x (m)',formula:'x=x₀+vt',shape:'Đường thẳng (thẳng đều)',slope:'k=v',areaMeaning:'Không có ý nghĩa diện tích chuẩn.',points:'Giao Ox: thời điểm x=0; giao nhau của hai đường → cùng vị trí cùng lúc.',memory:'x–t: nhìn dốc → biết v.'},
{id:'g10-v-t',grade:'10',area:'Cơ học',name:'Vận tốc – thời gian',x:'t (s)',y:'v (m/s)',formula:'v=v₀+at',shape:'Đường thẳng',slope:'k=a',areaMeaning:'Diện tích đại số = độ dịch chuyển Δx.',points:'v=0 → đổi chiều nếu gia tốc tiếp tục làm v đổi dấu.',memory:'v–t: dốc = a; diện tích = Δx.'},
{id:'g10-a-t',grade:'10',area:'Cơ học',name:'Gia tốc – thời gian',x:'t (s)',y:'a (m/s²)',formula:'a=const (chuyển động biến đổi đều)',shape:'Đường ngang',slope:'Độ dốc bằng 0 khi a không đổi.',areaMeaning:'Diện tích đại số = Δv.',points:'Trên Ox → a>0; dưới Ox → a<0.',memory:'a–t: diện tích → Δv.'},
{id:'g10-F-s',grade:'10',area:'Công – năng lượng',name:'Lực – quãng đường',x:'s (m)',y:'F (N)',formula:'A=∫F ds',shape:'Đường ngang nếu F không đổi',slope:'0 nếu F không đổi.',areaMeaning:'Diện tích dưới F–s = công A.',points:'Đổi dấu F → công có thể âm.',memory:'F–s: diện tích = công.'},
{id:'g10-F-dl',grade:'10',area:'Lực đàn hồi',name:'Lực đàn hồi – độ biến dạng',x:'Δl (m)',y:'F (N)',formula:'F=kΔl',shape:'Đường thẳng qua O',slope:'k',areaMeaning:'Diện tích không phải đại lượng chính trong bài cơ bản.',points:'O: chưa biến dạng.',memory:'Dốc của F–Δl = độ cứng k.'},
{id:'g10-F-N',grade:'10',area:'Lực ma sát',name:'Ma sát – áp lực',x:'N (N)',y:'Fms (N)',formula:'Fms=μN',shape:'Đường thẳng qua O',slope:'μ',areaMeaning:'Không dùng diện tích.',points:'O: N=0 → mô hình Fms=0.',memory:'Dốc = μ.'},
{id:'g11-x-t',grade:'11',area:'Dao động',name:'Li độ – thời gian',x:'t (s)',y:'x (m)',formula:'x=Acos(ωt+φ)',shape:'Sin/cos',slope:'dx/dt=v',areaMeaning:'Không dùng diện tích để đọc x.',points:'±A là biên; x=0 là cân bằng; chu kỳ T.',memory:'Biên: v=0. Cân bằng: |v|max.'},
{id:'g11-v-t',grade:'11',area:'Dao động',name:'Vận tốc – thời gian',x:'t (s)',y:'v (m/s)',formula:'v=−ωAsin(ωt+φ)',shape:'Sin/cos, sớm pha π/2 so với x',slope:'dv/dt=a',areaMeaning:'Diện tích đại số = Δx.',points:'v=0 tại biên; |v|max tại cân bằng.',memory:'v sớm x π/2.'},
{id:'g11-a-t',grade:'11',area:'Dao động',name:'Gia tốc – thời gian',x:'t (s)',y:'a (m/s²)',formula:'a=−ω²Acos(ωt+φ)',shape:'Sin/cos, ngược pha x',slope:'da/dt không phải đại lượng trọng tâm.',areaMeaning:'Không dùng diện tích trong dạng cơ bản.',points:'|a|max ở biên; a=0 tại cân bằng.',memory:'a ngược pha x.'},
{id:'g11-v-x',grade:'11',area:'Dao động',name:'Vận tốc – li độ',x:'x (m)',y:'v (m/s)',formula:'x²/A²+v²/(ω²A²)=1',shape:'Elip',slope:'Độ dốc thay đổi; không có ý nghĩa đơn giản cố định.',areaMeaning:'Không dùng diện tích trong dạng cơ bản.',points:'x=±A → v=0; x=0 → |v|=vmax.',memory:'Biên nằm ngang; cân bằng nằm trên/dưới.'},
{id:'g11-a-x',grade:'11',area:'Dao động',name:'Gia tốc – li độ',x:'x (m)',y:'a (m/s²)',formula:'a=−ω²x',shape:'Đường thẳng dốc âm qua O',slope:'−ω²',areaMeaning:'Không dùng diện tích.',points:'x=+A → a âm max; x=−A → a dương max.',memory:'x sang phải → a kéo sang trái.'},
{id:'g11-energy-t',grade:'11',area:'Dao động',name:'Động năng / thế năng – thời gian',x:'t (s)',y:'Wđ, Wt (J)',formula:'Wt=½kx²; Wđ=½mv²',shape:'Sin²/cos²; chu kỳ T/2',slope:'Thay đổi theo thời gian.',areaMeaning:'Không dùng diện tích.',points:'Wt max ở biên; Wđ max ở cân bằng; cơ năng không đổi.',memory:'Bình phương → chu kỳ còn T/2.'},
{id:'g11-wave-x',grade:'11',area:'Sóng cơ',name:'Li độ – vị trí tại một thời điểm',x:'x (m)',y:'u (m)',formula:'u=Acos(ωt−2πx/λ+φ)',shape:'Sin/cos theo không gian',slope:'Không phải đại lượng cố định.',areaMeaning:'Không dùng diện tích.',points:'Khoảng cách hai điểm gần nhau cùng pha = λ.',memory:'Đồ thị theo x → đọc bước sóng λ.'},
{id:'g11-wave-t',grade:'11',area:'Sóng cơ',name:'Li độ – thời gian tại một điểm',x:'t (s)',y:'u (m)',formula:'u=Acos(ωt+φ)',shape:'Sin/cos',slope:'du/dt là vận tốc dao động của phần tử.',areaMeaning:'Không dùng diện tích trong dạng cơ bản.',points:'Một chu kỳ thời gian = T.',memory:'Theo thời gian → đọc T, f, ω.'},
{id:'g11-standing',grade:'11',area:'Sóng dừng',name:'Hình dạng sóng dừng',x:'x (m)',y:'u (m)',formula:'A(x)∝|sin(2πx/λ)| (mô hình minh họa)',shape:'Nút – bụng lặp lại',slope:'Không dùng như đồ thị động lực học.',areaMeaning:'Không dùng diện tích.',points:'Nút: biên độ 0; bụng: biên độ cực đại.',memory:'Nút–bụng λ/4; nút–nút λ/2.'},
{id:'g11-E-r',grade:'11',area:'Điện trường',name:'Cường độ điện trường – khoảng cách',x:'r (m)',y:'E (N/C)',formula:'E=k|Q|/r²',shape:'Giảm theo 1/r²',slope:'Không cố định.',areaMeaning:'Không dùng diện tích.',points:'r×2 → E/4.',memory:'Ra xa 2 lần → điện trường còn 1/4.'},
{id:'g11-F-r',grade:'11',area:'Điện trường',name:'Lực Coulomb – khoảng cách',x:'r (m)',y:'F (N)',formula:'F=k|q₁q₂|/r²',shape:'Giảm theo 1/r²',slope:'Không cố định.',areaMeaning:'Không dùng diện tích.',points:'r×2 → F/4.',memory:'r² nằm mẫu → tăng r rất nhanh làm F giảm.'},
{id:'g11-I-t',grade:'11',area:'Dòng điện',name:'Cường độ dòng điện – thời gian',x:'t (s)',y:'I (A)',formula:'q=∫I dt',shape:'Đường ngang nếu I không đổi',slope:'0 nếu I không đổi.',areaMeaning:'Diện tích = điện lượng q.',points:'I>0 và I<0 thể hiện chiều quy ước.',memory:'I–t: diện tích = q.'},
{id:'g11-U-I-source',grade:'11',area:'Nguồn điện',name:'Hiệu điện thế mạch ngoài – dòng điện',x:'I (A)',y:'U (V)',formula:'U=ℰ−Ir',shape:'Đường thẳng dốc âm',slope:'−r',areaMeaning:'Không dùng diện tích.',points:'I=0 → U=ℰ.',memory:'Giao Oy = ℰ; độ dốc âm = −r.'},
{id:'g12-p-V',grade:'12',area:'Khí lý tưởng',name:'Áp suất – thể tích đẳng nhiệt',x:'V (m³)',y:'p (Pa)',formula:'pV=const',shape:'Hypebol',slope:'Không cố định.',areaMeaning:'Diện tích dưới p–V có thể liên quan công của khí trong nhiệt động lực học.',points:'V tăng → p giảm.',memory:'Đẳng nhiệt: pV giữ nguyên.'},
{id:'g12-V-T',grade:'12',area:'Khí lý tưởng',name:'Thể tích – nhiệt độ đẳng áp',x:'T (K)',y:'V (m³)',formula:'V/T=const',shape:'Đường thẳng qua O',slope:'V/T',areaMeaning:'Không dùng diện tích.',points:'T phải tính theo Kelvin.',memory:'Đẳng áp: V tỉ lệ T.'},
{id:'g12-p-T',grade:'12',area:'Khí lý tưởng',name:'Áp suất – nhiệt độ đẳng tích',x:'T (K)',y:'p (Pa)',formula:'p/T=const',shape:'Đường thẳng qua O',slope:'p/T',areaMeaning:'Không dùng diện tích.',points:'T phải tính theo Kelvin.',memory:'Đẳng tích: p tỉ lệ T.'},
{id:'g12-u-t',grade:'12',area:'Điện xoay chiều',name:'Điện áp xoay chiều – thời gian',x:'t (s)',y:'u (V)',formula:'u=U₀cos(ωt+φ)',shape:'Sin/cos',slope:'du/dt thay đổi theo pha.',areaMeaning:'Không dùng diện tích trong dạng cơ bản.',points:'U₀ là biên độ; U=U₀/√2 là hiệu dụng.',memory:'Hiệu dụng = biên độ / √2.'},
{id:'g12-ZL-f',grade:'12',area:'Điện xoay chiều',name:'Cảm kháng – tần số',x:'f (Hz)',y:'ZL (Ω)',formula:'ZL=2πfL',shape:'Đường thẳng qua O',slope:'2πL',areaMeaning:'Không dùng diện tích.',points:'f tăng → ZL tăng.',memory:'Cuộn cảm: f càng cao → cản càng mạnh.'},
{id:'g12-ZC-f',grade:'12',area:'Điện xoay chiều',name:'Dung kháng – tần số',x:'f (Hz)',y:'ZC (Ω)',formula:'ZC=1/(2πfC)',shape:'Giảm theo 1/f',slope:'Không cố định.',areaMeaning:'Không dùng diện tích.',points:'f tăng → ZC giảm.',memory:'Tụ điện: f càng cao → dung kháng càng nhỏ.'},
{id:'g12-I-f',grade:'12',area:'Điện xoay chiều',name:'Dòng điện – tần số trong RLC',x:'f (Hz)',y:'I (A)',formula:'I=U/Z',shape:'Đỉnh cộng hưởng',slope:'Thay đổi; không cố định.',areaMeaning:'Không dùng diện tích.',points:'f₀: ZL=ZC → Z=R → I max.',memory:'Cộng hưởng = ZL=ZC = I max.'},
{id:'g12-photon-f',grade:'12',area:'Lượng tử ánh sáng',name:'Năng lượng photon – tần số',x:'f (Hz)',y:'E (J)',formula:'E=hf',shape:'Đường thẳng qua O',slope:'h',areaMeaning:'Không dùng diện tích.',points:'f=0 → mô hình E=0; photon thực tế xét f>0.',memory:'f tăng → photon năng lượng lớn.'},
{id:'g12-W-f',grade:'12',area:'Quang điện',name:'Động năng cực đại – tần số',x:'f (Hz)',y:'Wđmax (J)',formula:'Wđmax=hf−A',shape:'Đường thẳng',slope:'h',areaMeaning:'Không dùng diện tích.',points:'Giao Ox là f₀: giới hạn quang điện.',memory:'f<f₀ → không có quang điện ngoài.'},
{id:'g12-Uh-f',grade:'12',area:'Quang điện',name:'Hiệu điện thế hãm – tần số',x:'f (Hz)',y:'Uh (V)',formula:'eUh=hf−A',shape:'Đường thẳng',slope:'h/e',areaMeaning:'Không dùng diện tích.',points:'Giao Ox → f₀.',memory:'Độ dốc Uh–f = h/e.'},
{id:'g12-N-t',grade:'12',area:'Hạt nhân',name:'Số hạt – thời gian phóng xạ',x:'t (s)',y:'N',formula:'N=N₀e^(−λt)',shape:'Hàm mũ giảm',slope:'Âm và thay đổi.',areaMeaning:'Không dùng diện tích.',points:'Sau T₁/₂ → N còn một nửa.',memory:'Mỗi bán rã: chia 2.'},
{id:'g12-H-t',grade:'12',area:'Hạt nhân',name:'Độ phóng xạ – thời gian',x:'t (s)',y:'H (Bq)',formula:'H=H₀e^(−λt)',shape:'Hàm mũ giảm',slope:'Âm và thay đổi.',areaMeaning:'Không dùng diện tích.',points:'Sau T₁/₂ → H còn một nửa.',memory:'H và N cùng giảm theo e^(−λt).'}
];
function renderGraphLibrary(filter=''){
 const q=filter.toLowerCase();
 const list=graphLibrary.filter(g=>(g.name+' '+g.area+' lớp '+g.grade+' '+g.formula).toLowerCase().includes(q));
 $('#graphLibrary').innerHTML=list.map((g,i)=>`<article class="graph-library-card"><div class="graph-meta"><span class="graph-grade">LỚP ${g.grade}</span><span>${g.area}</span></div><h3>${g.name}</h3><div class="graph-canvas-wrap"><canvas id="lib-${g.id}"></canvas></div><div class="graph-info"><div><b>Ox</b><span>${g.x}</span></div><div><b>Oy</b><span>${g.y}</span></div><div><b>Quan hệ</b><span>\(${g.formula}\)</span></div><div><b>Dạng</b><span>${g.shape}</span></div><div><b>Độ dốc</b><span>${g.slope}</span></div><div><b>Diện tích</b><span>${g.areaMeaning}</span></div></div><div class="graph-points"><b>📍 Điểm đặc biệt:</b> ${g.points}</div><div class="memory"><b>🧠 Mẹo:</b> ${g.memory}</div></article>`).join('') || '<div class="saved-item"><b>Không tìm thấy đồ thị.</b><p class="muted">Thử tìm “dao động”, “RLC”, “v-t”, “phóng xạ”...</p></div>';
 MathJax.typesetPromise();
 list.forEach(g=>drawLibraryChart('lib-'+g.id,g));
}
function drawLibraryChart(id,g){
 const c=document.getElementById(id);if(!c)return;const ctx=c.getContext('2d');
 const n=121, labels=Array.from({length:n},(_,i)=>(-2+i*4/(n-1)).toFixed(1));
 let data=[];
 if(g.id==='g10-x-t') data=labels.map(x=>Number(x));
 else if(g.id==='g10-v-t') data=labels.map(x=>Number(x));
 else if(g.id==='g10-a-t') data=labels.map(()=>1);
 else if(g.id==='g10-F-s'||g.id==='g10-F-dl'||g.id==='g10-F-N'||g.id==='g9-ohm'||g.id==='g9-energy-t'||g.id==='g12-V-T'||g.id==='g12-p-T'||g.id==='g12-ZL-f'||g.id==='g12-photon-f') data=labels.map(x=>Number(x));
 else if(g.id==='g9-power-u') data=labels.map(x=>x*x);
 else if(g.id==='g12-p-V'||g.id==='g11-E-r'||g.id==='g11-F-r'||g.id==='g12-ZC-f') data=labels.map(x=>1/(Math.abs(Number(x))+0.25));
 else if(g.id==='g11-v-x') data=labels.map(x=>Math.sqrt(Math.max(0,1-Number(x)**2)));
 else if(g.id==='g11-a-x') data=labels.map(x=>-Number(x));
 else if(g.id==='g11-energy-t') data=labels.map(x=>Math.pow(Math.sin(Number(x)*Math.PI/2),2));
 else if(g.id==='g11-standing') data=labels.map(x=>Math.sin(Number(x)*Math.PI)*0.85);
 else if(g.id==='g12-I-f') data=labels.map(x=>1/(0.25+Math.pow(Number(x),2)));
 else if(g.id==='g12-W-f'||g.id==='g12-Uh-f') data=labels.map(x=>Number(x));
 else if(g.id==='g12-N-t'||g.id==='g12-H-t') data=labels.map(x=>Math.exp(-Math.max(Number(x),-2)/1.2));
 else if(g.id==='g11-I-t') data=labels.map(()=>1);
 else data=labels.map(x=>Math.cos(Number(x)*Math.PI));
 const xTitle=g.x.split(' (')[0], yTitle=g.y.split(' (')[0];
 new Chart(ctx,{type:'line',data:{labels,datasets:[{data,borderWidth:2.5,pointRadius:0,tension:.12}]},options:{responsive:true,maintainAspectRatio:false,interaction:{mode:'index',intersect:false},plugins:{legend:{display:false},title:{display:false}},scales:{x:{position:'bottom',title:{display:true,text:xTitle},grid:{drawOnChartArea:true},border:{display:true,width:2},ticks:{maxTicksLimit:9}},y:{title:{display:true,text:yTitle},grid:{drawOnChartArea:true},border:{display:true,width:2},ticks:{maxTicksLimit:7},beginAtZero:false}}}});
}

function renderNav(){ $('#navList').innerHTML=`<button class="nav-item active" data-nav="home">⌂ Tổng quan</button><button class="nav-item" data-nav="graphs">⌁ Đồ thị</button>${grades.map(g=>`<button class="nav-item" data-nav="grade" data-grade="${g.id}">▣ ${g.title}</button>`).join('')}<button class="nav-item" data-nav="practice">✓ Luyện tập</button><button class="nav-item" data-nav="saved">★ Đã lưu</button>`; $$('.nav-item').forEach(b=>b.onclick=()=>{if(b.dataset.nav==='home')show('home');if(b.dataset.nav==='graphs')show('graphs');if(b.dataset.nav==='grade')showGrade(b.dataset.grade);if(b.dataset.nav==='practice')show('practice');if(b.dataset.nav==='saved')show('saved');closeMenu()})}
function renderGrades(filter=''){const list=grades.filter(g=>(g.title+g.desc+g.topics.join(' ')).toLowerCase().includes(filter.toLowerCase()));$('#gradeGrid').innerHTML=list.map(g=>`<article class="grade-card" tabindex="0" data-grade="${g.id}"><div class="num">${g.id}</div><h3>${g.title}</h3><p>${g.desc}</p><div class="tags">${g.topics.map(x=>`<span class="tag">${x}</span>`).join('')}</div></article>`).join('');$$('.grade-card').forEach(c=>{c.onclick=()=>showGrade(c.dataset.grade);c.onkeydown=e=>{if(e.key==='Enter')showGrade(c.dataset.grade)}})}
function show(id){$$('.view').forEach(v=>v.classList.remove('active'));$('#'+id+'View').classList.add('active');window.scrollTo({top:0,behavior:'smooth'});$$('.nav-item').forEach(x=>x.classList.remove('active'));const n=$(`[data-nav="${id==='home'?'home':id}"]`);if(n)n.classList.add('active');if(id==='saved')renderSaved();if(id==='graphs')renderGraphLibrary($('#graphSearch')?.value||'')}
function showGrade(g){
 show('detail');
 const arr=topics[g]||[]; const grade=grades.find(x=>x.id==g); const lawArr=laws[g]||[]; const tipArr=tips[g]||[];
 $('#detailContent').innerHTML=`
 <div class="detail-head"><div><span class="eyebrow">${grade.title.toUpperCase()} • CORE</span><h1>${grade.title}: hiểu từ gốc</h1><p class="muted">Mỗi chủ đề đi theo chuỗi: <b>bản chất → công thức → điều kiện → đồ thị → dạng bài → mẹo nhớ.</b></p></div><button class="btn btn-primary" data-action="practiceGrade">Luyện phần này</button></div>
 <section class="law-section"><div class="section-head compact"><div><span class="eyebrow">LAWS & PRINCIPLES</span><h2>Định luật & nguyên lý phải hiểu</h2><p class="muted">Đừng học thuộc tên trước — nhớ “nó nói điều gì” và “khi nào được dùng”.</p></div></div><div class="law-grid">${lawArr.map(l=>`<article class="law-card"><span class="law-kicker">ĐỊNH LUẬT</span><h3>${l.name}</h3><div class="law-formula">\\[${l.formula}\\]</div><p><b>Bản chất:</b> ${l.core}</p><p><b>Dùng khi:</b> ${l.use}</p><div class="memory"><b>🧠 Mẹo nhớ:</b> ${l.memory}</div></article>`).join('')}</div></section>
 <section class="tip-section"><div class="section-head compact"><div><span class="eyebrow">MEMORY HACKS</span><h2>Mẹo nhớ nhanh ${grade.title}</h2></div></div><div class="tip-grid">${tipArr.map((x,i)=>`<div class="tip-card"><span>${String(i+1).padStart(2,'0')}</span><p>${x}</p></div>`).join('')}</div></section>
 <div class="topic-grid">${arr.map((t,i)=>`<article class="topic-card"><h3>${t.name}</h3><div class="concept"><b>Bản chất</b><p>${t.essence}</p></div><div class="formula"><small>Công thức lõi</small>\\[${t.formula}\\]</div><div class="note-grid"><div class="mini"><b>Đơn vị</b>${t.units}</div><div class="mini"><b>Điều kiện</b>${t.condition}</div><div class="mini"><b>Nhớ bản chất</b>${t.insight}</div></div><div class="graph-box"><canvas id="chart-${g}-${i}"></canvas></div><h4>Dạng bài thường gặp</h4><div class="tags">${t.types.map(x=>`<span class="tag">${x}</span>`).join('')}</div><div class="exercise"><b>Ví dụ nhanh</b><p>${exampleFor(t.name)}</p></div><button class="btn btn-soft save-btn" data-save="${g}-${i}">${state.saved.has(`${g}-${i}`)?'★ Đã lưu':'☆ Lưu chủ đề'}</button></article>`).join('')}</div>`;
 MathJax.typesetPromise();
 arr.forEach((t,i)=>drawTopicChart(`chart-${g}-${i}`,t.name));
 $$('.save-btn').forEach(b=>b.onclick=()=>toggleSave(b.dataset.save));
 $('[data-action="practiceGrade"]').onclick=()=>show('practice');
}
function exampleFor(n){if(n.includes('Dao động'))return 'Một vật có A=5 cm, f=2 Hz. Hãy tìm ω và vmax. Gợi ý: đổi A sang mét, dùng ω=2πf rồi vmax=ωA.';if(n.includes('Vận tốc'))return 'Tại vị trí cân bằng, x=0 nên tốc độ đạt cực đại. Đây là cách đọc bản chất trước khi bấm máy.';if(n.includes('RLC'))return 'Cho R=30Ω, ZL=40Ω, ZC=20Ω. Khi đó Z=√(30²+20²).';if(n.includes('Newton'))return 'Vẽ sơ đồ lực → chọn trục → chiếu định luật II Newton → giải hệ.';return 'Xác định đại lượng cần tìm, kiểm tra đơn vị SI, chọn dạng công thức chứa đúng dữ kiện rồi mới thay số.'}
function drawTopicChart(id,name){
 const c=document.getElementById(id); if(!c)return;
 const ctx=c.getContext('2d'); const n=161;
 const labels=Array.from({length:n},(_,i)=>(-2*Math.PI+i*(4*Math.PI/(n-1))).toFixed(2));
 let data=[], xTitle='t', yTitle='y';
 for(let i=0;i<n;i++){
   const x=-2*Math.PI+i*(4*Math.PI/(n-1));
   if(name.includes('Dao động') && !name.includes('Vận tốc')) data.push(Math.cos(x));
   else if(name.includes('Vận tốc')) data.push(-Math.sin(x));
   else if(name.includes('Gia tốc')) data.push(-Math.cos(x));
   else if(name.includes('Sóng')) data.push(Math.sin(x));
   else if(name.includes('Giao thoa')) data.push(Math.cos(x));
   else if(name.includes('Sóng dừng')) data.push(0.85*Math.sin(x)*Math.cos(x/2));
   else if(name.includes('RLC')) data.push(Math.sqrt(1+Math.pow(1.25*Math.sin(x),2))*10);
   else data.push(Math.sin(x));
 }
 if(name.includes('Dao động')||name.includes('Vận tốc')||name.includes('Gia tốc')){xTitle='ωt+φ';yTitle=name.includes('Vận tốc')?'v':name.includes('Gia tốc')?'a':'x';}
 if(name.includes('Sóng')){xTitle='vị trí / pha';yTitle='li độ';}
 if(name.includes('RLC')){xTitle='tần số';yTitle='Z';}
 new Chart(ctx,{type:'line',data:{labels,datasets:[{data,borderWidth:2.5,pointRadius:0,tension:.15}]},options:{responsive:true,maintainAspectRatio:false,interaction:{mode:'index',intersect:false},plugins:{legend:{display:false},title:{display:true,text:`Đồ thị ${name}`,font:{size:13,weight:'700'}}},scales:{x:{position:'bottom',title:{display:true,text:xTitle},grid:{color:'rgba(148,163,184,.14)'},border:{display:true,width:2,color:'#64748b'},ticks:{maxTicksLimit:9,padding:6}},y:{title:{display:true,text:yTitle},grid:{color:'rgba(148,163,184,.14)'},border:{display:true,width:2,color:'#64748b'},ticks:{maxTicksLimit:7,padding:6},beginAtZero:true}}}});
}
function renderHomeChart(){const c=$('#heroChart');if(!c)return;const labels=Array.from({length:101},(_,i)=>(i/20).toFixed(2));if(state.chart)state.chart.destroy();state.chart=new Chart(c,{type:'line',data:{labels,datasets:[{data:labels.map(x=>Math.cos(Number(x)*2*Math.PI)),borderWidth:3,pointRadius:0,tension:.25}]},options:{responsive:true,plugins:{legend:{display:false}},scales:{x:{display:false},y:{display:false}}}})}
function toggleSave(id){if(state.saved.has(id))state.saved.delete(id);else state.saved.add(id);persist();showGrade(state.topic||id.split('-')[0]);toast(state.saved.has(id)?'Đã lưu vào bộ nhớ của bạn':'Đã bỏ lưu')}
async function persist(){if(!state.user)return;await setDoc(doc(db,'users',state.user.uid),{saved:[...state.saved],updatedAt:new Date().toISOString()},{merge:true}).catch(()=>{})}
async function loadUserData(){if(!state.user)return;const s=await getDoc(doc(db,'users',state.user.uid)).catch(()=>null);if(s?.exists())state.saved=new Set(s.data().saved||[]);}
function renderSaved(){if(!state.saved.size){$('#savedList').innerHTML='<div class="saved-item"><b>Chưa có chủ đề.</b><p class="muted">Mở một lớp → bấm “Lưu chủ đề”.</p></div>';return}$('#savedList').innerHTML=[...state.saved].map(id=>{const [g,i]=id.split('-'),t=(topics[g]||[])[i];return t?`<div class="saved-item"><b>Lớp ${g} · ${t.name}</b><p>${t.essence}</p><button class="btn btn-soft" onclick="window.__openSaved('${g}')">Mở</button></div>`:''}).join('')}
window.__openSaved=g=>showGrade(g);
const questions=[{q:'Trong dao động điều hòa, tại biên vật có đặc điểm nào?',a:['v=0, |a|max','|v|max, a=0','v và a đều cực đại','x=0'],c:0,e:'Ở biên, x=±A nên v=0; vì a=−ω²x nên độ lớn gia tốc cực đại.'},{q:'Nếu tần số dao động tăng 2 lần thì chu kỳ thay đổi thế nào?',a:['Tăng 2 lần','Giảm 2 lần','Không đổi','Tăng 4 lần'],c:1,e:'T=f⁻¹ nên f tăng 2 lần thì T giảm 2 lần.'},{q:'Trong RLC nối tiếp, cộng hưởng xảy ra khi:',a:['R=0','ZL=ZC','ZL=R','ZC=R'],c:1,e:'Khi ZL=ZC, phần cảm và dung triệt tiêu nhau → Z=R.'}];
function renderQuiz(){const q=questions[Math.floor(Math.random()*questions.length)];$('#quizBox').innerHTML=`<span class="eyebrow">CHECK UNDERSTANDING</span><h2>${q.q}</h2>${q.a.map((x,i)=>`<button class="quiz-option" data-i="${i}">${String.fromCharCode(65+i)}. ${x}</button>`).join('')}<p id="quizExplain" class="muted"></p>`;$$('.quiz-option').forEach(b=>b.onclick=()=>{const ok=+b.dataset.i===q.c;$$('.quiz-option').forEach(x=>x.disabled=true);b.classList.add(ok?'correct':'wrong');$('#quizExplain').textContent=(ok?'✓ Đúng. ':'✗ Chưa đúng. ')+q.e})}
function toast(t){const x=$('#toast');x.textContent=t;x.classList.add('show');setTimeout(()=>x.classList.remove('show'),2200)}
function closeMenu(){$('#sidebar').classList.remove('open');$('#menuBtn').setAttribute('aria-expanded','false')}
$('#menuBtn').onclick=()=>{$('#sidebar').classList.toggle('open');$('#menuBtn').setAttribute('aria-expanded',$('#sidebar').classList.contains('open'))};$('#closeMenu').onclick=closeMenu;$('#searchInput').oninput=e=>renderGrades(e.target.value);$('[data-action="start"]').onclick=()=>showGrade('11');$('[data-action="random"]').onclick=()=>showGrade(['9','10','11','12'][Math.floor(Math.random()*4)]);$('[data-action="randomQuestion"]').onclick=renderQuiz);$('[data-action="home"]').onclick=()=>show('home');$('#themeBtn').onclick=()=>{document.body.classList.toggle('dark');localStorage.setItem('dark',document.body.classList.contains('dark'))};
$('#authBtn').onclick=()=>state.user?signOut(auth):$('#authDialog').showModal();$('#loginBtn').onclick=async e=>{e.preventDefault();try{await signInWithEmailAndPassword(auth,$('#email').value,$('#password').value);$('#authDialog').close();toast('Đăng nhập thành công')}catch(err){toast(err.code||'Đăng nhập thất bại')}};$('#signupBtn').onclick=async()=>{try{await createUserWithEmailAndPassword(auth,$('#email').value,$('#password').value);$('#authDialog').close();toast('Tạo tài khoản thành công')}catch(err){toast(err.code||'Không tạo được tài khoản')}};
onAuthStateChanged(auth,async u=>{state.user=u;$('#authBtn').textContent=u?'Đăng xuất':'Đăng nhập';await loadUserData();});
renderNav();renderGrades();renderQuiz();renderHomeChart();$('#graphSearch')?.addEventListener('input',e=>renderGraphLibrary(e.target.value));if(localStorage.getItem('dark')==='true')document.body.classList.add('dark');
