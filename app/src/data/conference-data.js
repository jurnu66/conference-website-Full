/**
 * ข้อมูลทั้งหมดของเว็บ Mini-Conference อยู่ในไฟล์นี้ไฟล์เดียว (ทั้งภาษาไทยและอังกฤษ)
 * แก้ข้อความ/วันที่/รายชื่อที่นี่ แล้วรัน `npm run build` เว็บทุกหน้าทั้ง 2 ภาษาจะอัปเดตตาม
 *
 * รูปแบบข้อความ:
 *   { th: "ภาษาไทย", en: "English" }  → แสดงตามภาษาที่เลือก
 *   "ข้อความเดียว"                     → แสดงเหมือนกันทั้ง 2 ภาษา (เช่น ตัวเลข ชื่อคน)
 *
 * Placeholder ที่ใช้ (แสดงเป็นสีจางอัตโนมัติ):
 *   "[...]"            = ยังไม่ได้ตั้งชื่อ/ข้อความ
 *   "รอประกาศ" / "TBA" = ยังไม่มีข้อมูล
 *   "---"              = ยังไม่ได้ระบุชื่อคน
 */

const TBA = { th: "รอประกาศ", en: "TBA" };
const HEAD = { th: "หัวหน้า", en: "Head" };
const SUBHEAD = { th: "รองหัวหน้า", en: "Subhead" };
const LEAD = { th: "ผู้รับผิดชอบ", en: "Lead" };

const CONFERENCE_DATA = {
  course: {
    code: "300-1412",
    name: { th: "สัมมนาทางวิศวกรรมคอมพิวเตอร์", en: "Seminar in Computer Engineering" },
    faculty: { th: "คณะเทคโนโลยีดิจิทัล", en: "Faculty of Digital Technology" },
    institute: { th: "สถาบันเทคโนโลยีจิตรลดา", en: "Chitralada Technology Institute" },
    instituteShort: "CDTI",
    instituteUrl: "https://www.cdti.ac.th",
    siteUrl: "https://cpe-seminar-2026.netlify.app",   // ลิงก์เว็บจริง (ใช้บอก Google ว่ามี 2 ภาษา)
    instructors: ["Sumalee Unhavanich", "Arnon Rungsawang"],
    year: "2026"
  },

  conference: {
    acronym: "ICC-CDTI 2026",
    // ชื่อภาษาไทยแปลจากชื่ออังกฤษไว้ก่อน (ที่ประชุม 12/11/2026 ยังไม่ได้ตั้งชื่อไทย)
    name: { th: "การประชุมวิชาการด้านคอมพิวเตอร์ภายใน CDTI ครั้งที่ 1", en: "The 1st Internal Computing CDTI Mini-Conference" },
    theme: { th: "เทคโนโลยีนวัตกรรม", en: "Innovation Technology" },
    date: TBA,
    dateNote: { th: "สัปดาห์ที่ 9 ของภาคเรียน", en: "Week 9 of the semester" },
    venue: TBA,
    venueNote: { th: "สถาบันเทคโนโลยีจิตรลดา", en: "Chitralada Technology Institute" },
    format: { th: "บรรยาย + โปสเตอร์", en: "Oral + Poster" },
    audience: { th: "[กลุ่มเป้าหมาย เช่น นักศึกษา อาจารย์ และผู้สนใจด้านวิศวกรรมคอมพิวเตอร์]",
                en: "[Target audience, e.g. students, faculty and anyone interested in computer engineering]" },
    status: { th: "กำลังเตรียมงาน", en: "In preparation" }
  },

  stats: [
    { value: "14", label: { th: "ผู้เขียน", en: "Authors" } },
    { value: "14", label: { th: "บทความ", en: "Papers" } },
    { value: "4", label: { th: "นำเสนอแบบบรรยาย", en: "Oral presentations" } },
    { value: "10", label: { th: "นำเสนอแบบโปสเตอร์", en: "Poster presentations" } },
    { value: "9", label: { th: "สัปดาห์เตรียมงาน", en: "Weeks of preparation" } }
  ],

  // กำหนดการสำคัญ — ใส่วันที่จริงแทน TBA เมื่อตกลงแล้ว เช่น date: { th: "15 ธ.ค. 2569", en: "15 Dec 2026" }
  dates: [
    { week: 3, title: { th: "ประกาศรับบทความ", en: "Call for papers" }, date: TBA },
    { week: 4, title: { th: "เปิดระบบส่งบทความ", en: "Submission opens" }, date: TBA },
    { week: 6, title: { th: "ปิดรับบทความ", en: "Submission deadline" }, date: TBA, key: true },
    { week: 7, title: { th: "แจ้งผลการพิจารณา", en: "Notification of acceptance" }, date: TBA },
    { week: 8, title: { th: "ส่งบทความฉบับสมบูรณ์", en: "Camera-ready due" }, date: TBA },
    { week: 9, title: { th: "วันจัดงาน", en: "Conference day" }, date: TBA, key: true }
  ],

  // ประเภทโปรเจกต์ 6 กลุ่ม (ตกลงในที่ประชุม 12/11/2026) — คำอธิบายเป็นร่าง แก้ได้
  topics: [
    { icon: "layers", name: { th: "ระบบ", en: "System" },
      desc: { th: "ระบบสารสนเทศ แอปพลิเคชัน และสถาปัตยกรรมซอฟต์แวร์", en: "Information systems, applications and software architecture" } },
    { icon: "cpu", name: { th: "ปัญญาประดิษฐ์", en: "Artificial Intelligence (AI)" },
      desc: { th: "ระบบอัจฉริยะ การประมวลผลภาษาและภาพ", en: "Intelligent systems, language and image processing" } },
    { icon: "database", name: { th: "ฐานข้อมูล", en: "Database" },
      desc: { th: "การออกแบบฐานข้อมูล การจัดการและวิเคราะห์ข้อมูล", en: "Database design, data management and analytics" } },
    { icon: "trend", name: { th: "การเรียนรู้ของเครื่อง", en: "Machine Learning (ML)" },
      desc: { th: "โมเดลการเรียนรู้ของเครื่องสำหรับการพยากรณ์และการจำแนก", en: "Machine learning models for prediction and classification" } },
    { icon: "chip", name: { th: "อินเทอร์เน็ตของสรรพสิ่ง", en: "Internet of Things (IoT)" },
      desc: { th: "อุปกรณ์เชื่อมต่อ เซนเซอร์ และระบบสมองกลฝังตัว", en: "Connected devices, sensors and embedded systems" } },
    { icon: "shield", name: { th: "ความมั่นคงปลอดภัย", en: "Security" },
      desc: { th: "ความปลอดภัยของระบบ เครือข่าย และข้อมูล", en: "System, network and data security" } }
  ],

  // วิทยากร — เติมเมื่อได้ชื่อ
  keynotes: [
    { name: { th: "[ชื่อวิทยากร]", en: "[Speaker name]" }, affiliation: { th: "[หน่วยงาน]", en: "[Affiliation]" }, talk: { th: "[หัวข้อบรรยาย]", en: "[Talk title]" } },
    { name: { th: "[ชื่อวิทยากร]", en: "[Speaker name]" }, affiliation: { th: "[หน่วยงาน]", en: "[Affiliation]" }, talk: { th: "[หัวข้อบรรยาย]", en: "[Talk title]" } }
  ],

  // กำหนดการวันงาน — แท็บละช่วง (type: break / talk / oral / poster)
  program: [
    {
      tab: { th: "ช่วงเช้า", en: "Morning" },
      items: [
        { time: "--:--", type: "break", title: { th: "ลงทะเบียน", en: "Registration" } },
        { time: "--:--", type: "talk", title: { th: "พิธีเปิด", en: "Opening" } },
        { time: "--:--", type: "talk", title: { th: "บรรยายพิเศษ", en: "Keynote" }, note: { th: "[หัวข้อบรรยาย]", en: "[Talk title]" } },
        { time: "--:--", type: "oral", title: { th: "นำเสนอแบบบรรยาย ช่วงที่ 1", en: "Oral session 1" }, note: { th: "บทความ 2 เรื่อง", en: "2 papers" } }
      ]
    },
    {
      tab: { th: "ช่วงบ่าย", en: "Afternoon" },
      items: [
        { time: "--:--", type: "break", title: { th: "พักรับประทานอาหารกลางวัน", en: "Lunch" } },
        { time: "--:--", type: "oral", title: { th: "นำเสนอแบบบรรยาย ช่วงที่ 2", en: "Oral session 2" }, note: { th: "บทความ 2 เรื่อง", en: "2 papers" } },
        { time: "--:--", type: "poster", title: { th: "นำเสนอแบบโปสเตอร์", en: "Poster session" }, note: { th: "บทความ 10 เรื่อง", en: "10 papers" } },
        { time: "--:--", type: "talk", title: { th: "พิธีปิด", en: "Closing" } }
      ]
    }
  ],

  // ทีมผู้จัดงาน (ที่ประชุม 12/11/2026) — people: บทบาท + ชื่อ, ยังไม่มีคนใส่ "---"
  // ชื่อแสดงเป็นภาษาไทยทั้ง 2 ภาษาไปก่อน ถ้ามีชื่อสะกดอังกฤษให้เขียน name: { th: "...", en: "..." }
  teams: [
    { id: "chair", name: { th: "ประธานจัดงาน", en: "General Chair" }, duty: { th: "ประสานงานภาพรวมของทุกทีม", en: "Overall coordination" },
      people: [{ role: HEAD, name: "วีรภัทร สาลีผล" }] },
    { id: "tpc", name: { th: "ฝ่ายวิชาการ", en: "Technical Chair" }, duty: { th: "พิจารณาบทความและจัดโปรแกรม", en: "Paper review and program" },
      people: [{ role: HEAD, name: "พชร เพิ่มพูล" }, { role: SUBHEAD, name: "พัชรนันท์" }] },
    { id: "web", name: { th: "ฝ่ายเว็บไซต์และประชาสัมพันธ์", en: "Website & Public Chair" }, duty: { th: "เว็บไซต์ ระบบส่งบทความ และการประชาสัมพันธ์", en: "Website, submission system and publicity" },
      people: [{ role: "Frontend", name: "กฤตชัย พรายศรี" }, { role: "Backend", name: "จุลพงศ์" }] },
    { id: "design", name: { th: "ฝ่ายออกแบบ", en: "Design" }, duty: { th: "อัตลักษณ์ของงาน โปสเตอร์ และสื่อต่าง ๆ", en: "Visual identity, posters and media" },
      people: [{ role: LEAD, name: "เนติ" }] },
    { id: "venue", name: { th: "ฝ่ายสถานที่และการจัดงาน", en: "Venue & Logistics" }, duty: { th: "ห้อง อุปกรณ์ และการจัดงานในวันจริง", en: "Room, equipment and event operation" },
      people: [{ role: HEAD, name: "กมลวรรณ" }, { role: SUBHEAD, name: "ชินวัตร" }] },
    { id: "pub", name: { th: "ฝ่ายสิ่งพิมพ์", en: "Publication Team" }, duty: { th: "เทมเพลตบทความและรวมเล่มบทความ", en: "Templates and proceedings" },
      people: [{ role: HEAD, name: "---" }] }
  ],

  // แผนงาน 9 สัปดาห์ (จากสไลด์ Week 1)
  roadmap: [
    { week: 1, title: { th: "เปิดโครงการและตั้งทีม", en: "Conference kickoff and organization" }, done: true },
    { week: 2, title: { th: "พัฒนาบทความวิจัย", en: "Research paper development" } },
    { week: 3, title: { th: "ประกาศรับบทความและนโยบายการพิจารณา", en: "CFP and review policy" } },
    { week: 4, title: { th: "เว็บไซต์และระบบส่งบทความ", en: "Website and submission system" } },
    { week: 5, title: { th: "เตรียมการพิจารณาบทความ", en: "Peer review preparation" } },
    { week: 6, title: { th: "ปิดรับบทความ ฝึกการนำเสนอ", en: "Submission deadline and presentation skills" } },
    { week: 7, title: { th: "ประชุมคณะกรรมการวิชาการและตัดสินผล", en: "PC meeting and decisions" } },
    { week: 8, title: { th: "เตรียมงานและซ้อมใหญ่", en: "Final preparation and rehearsal" } },
    { week: 9, title: { th: "วันจัดงาน", en: "Mini-Conference" } }
  ],

  // ขั้นตอนของงานประชุมวิชาการ (จากสไลด์ Week 1)
  workflow: [
    { th: "ประกาศรับบทความ", en: "Call for Papers" }, { th: "ส่งบทความ", en: "Paper Submission" },
    { th: "พิจารณาบทความ", en: "Peer Review" }, { th: "ประชุมคณะกรรมการวิชาการ", en: "PC Meeting" },
    { th: "แจ้งผลการพิจารณา", en: "Acceptance" }, { th: "ส่งฉบับสมบูรณ์", en: "Camera-Ready" },
    { th: "จัดทำกำหนดการ", en: "Program" }, { th: "วันจัดงาน", en: "Conference Day" },
    { th: "รวมเล่มบทความ", en: "Proceedings" }
  ],

  submission: {
    systemNote: { th: "ระบบส่งบทความจะเปิดในสัปดาห์ที่ 4", en: "The submission system opens in week 4." },
    length: { th: "[จำนวนหน้า]", en: "[Page limit]" },
    language: { th: "[ภาษาของบทความ]", en: "[Paper language]" },
    review: { th: "[รูปแบบการพิจารณา เช่น ไม่เปิดเผยชื่อทั้งสองฝ่าย]", en: "[Review type, e.g. double-blind]" },
    templates: [
      { key: "word", label: { th: "เทมเพลต Word", en: "Word template" }, file: "" },
      { key: "latex", label: { th: "เทมเพลต LaTeX", en: "LaTeX template" }, file: "" }
    ]
  },

  registration: {
    fee: TBA,
    note: { th: "[รายละเอียดการลงทะเบียน]", en: "[Registration details]" },
    types: [
      { name: { th: "ผู้นำเสนอบทความ", en: "Author / presenter" }, detail: { th: "ลงทะเบียนพร้อมส่งบทความ", en: "Register when you submit your paper" } },
      { name: { th: "ผู้เข้าร่วมทั่วไป", en: "Attendee" }, detail: TBA }
    ]
  },

  venue: {
    name: TBA,
    address: { th: "สถาบันเทคโนโลยีจิตรลดา [ห้อง / อาคาร]", en: "Chitralada Technology Institute [room / building]" }
  },

  // รูปประกอบ (อยู่ใน src/img) — ภาพจริงจากเว็บสถาบันเทคโนโลยีจิตรลดา (cdti.ac.th)
  // เปลี่ยนรูปได้: วางไฟล์ใหม่ใน src/img แล้วแก้ชื่อไฟล์ตรงนี้
  images: {
    hero: { file: "cdti-cpe-lab-group.jpg",
      alt: { th: "นักศึกษาวิศวกรรมคอมพิวเตอร์ CDTI ทำงานกับอุปกรณ์ในห้องปฏิบัติการ", en: "CDTI computer engineering students working with lab equipment" },
      credit: "สถาบันเทคโนโลยีจิตรลดา: หลักสูตรวิศวกรรมคอมพิวเตอร์", source: "https://www.cdti.ac.th/branch/computer-engineering-program/" },
    poster: { file: "cdti-students-team.jpg",
      alt: { th: "นักศึกษา CDTI ช่วยกันทำงานที่โต๊ะคอมพิวเตอร์", en: "CDTI students working together at a computer" },
      credit: "สถาบันเทคโนโลยีจิตรลดา: หลักสูตรวิศวกรรมคอมพิวเตอร์", source: "https://www.cdti.ac.th/branch/computer-engineering-program/" },
    research: { file: "cdti-cpe-hardware.jpg",
      alt: { th: "นักศึกษา CDTI วัดค่าวงจรบนแผงคอมพิวเตอร์", en: "A CDTI student measuring a computer circuit board" },
      credit: "สถาบันเทคโนโลยีจิตรลดา: หลักสูตรวิศวกรรมคอมพิวเตอร์", source: "https://www.cdti.ac.th/branch/computer-engineering-program/" },
    panel: { file: "cdti-server-room.jpg",
      alt: { th: "นักศึกษา CDTI ทำงานในห้องเซิร์ฟเวอร์", en: "CDTI students working in a server room" },
      credit: "สถาบันเทคโนโลยีจิตรลดา: คณะเทคโนโลยีดิจิทัล", source: "https://www.cdti.ac.th/faculty/faculty-of-digital-technology/" }
  },

  contact: {
    email: TBA,
    phone: TBA,
    office: { th: "คณะเทคโนโลยีดิจิทัล สถาบันเทคโนโลยีจิตรลดา", en: "Faculty of Digital Technology, Chitralada Technology Institute" }
  }
};

if (typeof module !== "undefined" && module.exports) {
  module.exports = CONFERENCE_DATA;
}
