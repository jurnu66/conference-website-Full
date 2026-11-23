/**
 * ==============================================================================
 * ไฟล์ข้อมูลส่วนกลางสำหรับเว็บไซต์ Mini-Conference (Conference Data Central Store)
 * ==============================================================================
 * คำแนะนำสำหรับผู้ดูแลที่ไม่เขียนโค้ด:
 * คุณสามารถแก้ไขข้อความ วันที่ รายชื่อ และข้อมูลต่างๆ ในไฟล์นี้ได้โดยตรง
 * เว็บไซต์ทุกหน้าจะดึงข้อมูลจากไฟล์นี้ไปแสดงผลโดยอัตโนมัติ
 *
 * สัญลักษณ์ Placeholder:
 * - "[ชื่อ...]" สำหรับชื่อที่ยังไม่ได้ระบุ
 * - "TBA · รอประกาศ" สำหรับวันที่หรือสถานที่ที่รอการยืนยัน
 * - "---" สำหรับรายชื่อคณะทำงานที่กำลังเปิดรับหรืออยู่ระหว่างแต่งตั้ง
 */

const CONFERENCE_DATA = {
  // ข้อมูลสถาบันและหลักสูตร
  meta: {
    courseCode: "300-1412",
    courseNameTh: "สัมมนาทางวิศวกรรมคอมพิวเตอร์",
    courseNameEn: "Seminar in Computer Engineering (Seminar in CPE)",
    facultyTh: "คณะเทคโนโลยีดิจิทัล สาขาวิชาวิศวกรรมคอมพิวเตอร์",
    facultyEn: "Faculty of Digital Technology, Department of Computer Engineering",
    instituteTh: "สถาบันเทคโนโลยีจิตรลดา (CDTI)",
    instituteEn: "Chitralada Technology Institute",
    instituteShort: "CDTI",
    officialWebsite: "https://www.cdti.ac.th",
    academicYear: "2025"
  },

  // ข้อมูลภาพรวมงานประชุม
  conference: {
    nameTh: "[ชื่อการประชุมวิชาการ CPE Mini-Conference ครั้งที่ 1]",
    nameEn: "[The 1st CDTI Seminar in CPE Mini-Conference (CPE-MC 2025)]",
    shortName: "CPE-MC 2025",
    themeTh: "[ธีม: นวัตกรรมและเทคโนโลยีคอมพิวเตอร์เพื่อการพัฒนาที่ยั่งยืน]",
    themeEn: "[Theme: Emerging Innovations in Computing, AI & IoT for Sustainable Society]",
    dateTh: "TBA · รอประกาศ (สัปดาห์ที่ 9 ของภาคการศึกษา)",
    dateEn: "TBA · To Be Announced (Week 9)",
    timeTh: "08:30 น. - 16:30 น.",
    timeEn: "08:30 AM - 04:30 PM",
    venueTh: "TBA · รอประกาศ (อาคาร 60 พรรษา ราชสุดาสมโภช สถาบันเทคโนโลยีจิตรลดา)",
    venueEn: "TBA · To Be Announced (60th Anniversary Building, CDTI)",
    formatTh: "แบบผสมผสาน (Onsite Presentation & Online Live Stream)",
    formatEn: "Hybrid (In-person Presentation & Live Stream)",
    statusBadge: "เปิดรับบทความวิชาการ (Call for Papers Open)"
  },

  // สถิติและตัวเลขสรุป
  statistics: [
    { value: "14", labelTh: "ผู้นำเสนอบทความ", labelEn: "Authors", icon: "bi-people" },
    { value: "14", labelTh: "บทความวิจัยทั้งหมด", labelEn: "Papers", icon: "bi-journal-text" },
    { value: "4", labelTh: "การนำเสนอแบบบรรยาย", labelEn: "Oral Presentations", icon: "bi-mic" },
    { value: "10", labelTh: "การนำเสนอแบบโปสเตอร์", labelEn: "Poster Presentations", icon: "bi-easel" },
    { value: "9", labelTh: "สัปดาห์ตามแผนงาน", labelEn: "Weeks Roadmap", icon: "bi-calendar-check" }
  ],

  // กำหนดการสำคัญ (Important Dates)
  importantDates: [
    {
      id: "cfp",
      titleTh: "ประกาศเปิดรับบทความวิจัย (CFP)",
      titleEn: "Call for Papers Announcement",
      dateTh: "TBA · รอประกาศ (สัปดาห์ที่ 3)",
      dateEn: "TBA · Week 3",
      status: "open",
      statusBadge: "เปิดรับบทความ",
      descTh: "เผยแพร่นโยบายการส่งบทความ ข้อกำหนด และเทมเพลตต้นแบบ"
    },
    {
      id: "submission",
      titleTh: "วันปิดรับบทความฉบับเต็ม (Full Paper)",
      titleEn: "Paper Submission Deadline",
      dateTh: "TBA · รอประกาศ (สัปดาห์ที่ 6)",
      dateEn: "TBA · Week 6",
      status: "upcoming",
      statusBadge: "รอประกาศ",
      descTh: "ส่งผ่านระบบออนไลน์ของรายวิชาสัมมนา"
    },
    {
      id: "review",
      titleTh: "ช่วงเวลาพิจารณาบทความ (Peer Review)",
      titleEn: "Peer Review Period",
      dateTh: "TBA · รอประกาศ (สัปดาห์ที่ 6 - 7)",
      dateEn: "TBA · Week 6-7",
      status: "upcoming",
      statusBadge: "รอประกาศ",
      descTh: "กระบวนการตรวจประเมินแบบ Double-Blind Peer Review"
    },
    {
      id: "pc-meeting",
      titleTh: "การประชุมคณะกรรมการ PC Meeting",
      titleEn: "Program Committee Decision Meeting",
      dateTh: "TBA · รอประกาศ (สัปดาห์ที่ 7)",
      dateEn: "TBA · Week 7",
      status: "upcoming",
      statusBadge: "รอประกาศ",
      descTh: "ตัดสินผลการยอมรับบทความ Oral (4) และ Poster (10)"
    },
    {
      id: "acceptance",
      titleTh: "ประกาศผลการพิจารณาบทความ",
      titleEn: "Notification of Acceptance",
      dateTh: "TBA · รอประกาศ (สัปดาห์ที่ 7)",
      dateEn: "TBA · Week 7",
      status: "upcoming",
      statusBadge: "รอประกาศ",
      descTh: "แจ้งผลพร้อมข้อเสนอแนะจากผู้ทรงคุณวุฒิแก่นักศึกษาทุกคน"
    },
    {
      id: "camera-ready",
      titleTh: "ส่งบทความฉบับสมบูรณ์ (Camera-Ready)",
      titleEn: "Camera-Ready Submission Deadline",
      dateTh: "TBA · รอประกาศ (สัปดาห์ที่ 8)",
      dateEn: "TBA · Week 8",
      status: "upcoming",
      statusBadge: "รอประกาศ",
      descTh: "ปรับปรุงบทความตามข้อเสนอแนะและเตรียมส่งรายงานการประชุม"
    },
    {
      id: "conference-day",
      titleTh: "วันจัดงานประชุมวิชาการ (Mini-Conference)",
      titleEn: "Mini-Conference Day",
      dateTh: "TBA · รอประกาศ (สัปดาห์ที่ 9)",
      dateEn: "TBA · Week 9",
      status: "highlight",
      statusBadge: "วันจัดงานจริง",
      descTh: "การนำเสนอผลงานทางวิชาการและมอบรางวัล Best Paper"
    }
  ],

  // หัวข้อการประชุม (Topics / Scope)
  topics: [
    {
      id: "ai-ds",
      code: "Track 1",
      nameTh: "ปัญญาประดิษฐ์และวิทยาการข้อมูล",
      nameEn: "AI & Data Science",
      icon: "bi-cpu",
      color: "#4B78BC",
      descTh: "การเรียนรู้ของเครื่อง (Machine Learning), การประมวลผลภาษาธรรมชาติ (NLP), คอมพิวเตอร์วิทัศน์ (Computer Vision), และการวิเคราะห์ข้อมูลขนาดใหญ่ (Big Data Analytics)",
      descEn: "Machine Learning, Deep Learning, Natural Language Processing, Computer Vision, Big Data Analytics & Predictive Modeling",
      subtopics: [
        "Machine Learning & Deep Learning",
        "Natural Language Processing for Thai Language",
        "Computer Vision & Pattern Recognition",
        "Data Engineering & Analytics Pipelines"
      ]
    },
    {
      id: "se",
      code: "Track 2",
      nameTh: "วิศวกรรมซอฟต์แวร์และแอปพลิเคชัน",
      nameEn: "Software Engineering",
      icon: "bi-code-slash",
      color: "#083965",
      descTh: "สถาปัตยกรรมซอฟต์แวร์สมัยใหม่, การพัฒนาเว็บและโมบาย, DevOps, ไมโครเซอร์วิส และกระบวนการทดสอบซอฟต์แวร์เชิงคุณภาพ",
      descEn: "Software Architecture, Web & Mobile Engineering, DevOps, Cloud-Native Systems, Microservices, and Automated Quality Assurance",
      subtopics: [
        "Cloud-Native & Microservice Architectures",
        "Full-Stack Web & Mobile App Frameworks",
        "CI/CD, DevOps & SRE Best Practices",
        "Agile Methodologies & Code Quality Metrics"
      ]
    },
    {
      id: "networks-security",
      code: "Track 3",
      nameTh: "เครือข่ายและความมั่นคงปลอดภัยไซเบอร์",
      nameEn: "Networks & Cybersecurity",
      icon: "bi-shield-check",
      color: "#0E2B41",
      descTh: "ความมั่นคงปลอดภัยสารสนเทศ, การตรวจจับการบุกรุก, เครือข่ายไร้สายและ 5G/6G, การป้องกันภัยคุกคาม และวิทยาการรหัสลับ",
      descEn: "Network Architectures, Intrusion Detection Systems, Cloud Security, Threat Intelligence, Cryptography, and Zero-Trust Architectures",
      subtopics: [
        "Network Security & Intrusion Detection",
        "Zero Trust Architecture & Identity Management",
        "Wireless & Next-Generation Networks (5G/6G)",
        "Security Compliance & Digital Forensics"
      ]
    },
    {
      id: "iot-embedded",
      code: "Track 4",
      nameTh: "ระบบสมองกลฝังตัวและอินเทอร์เน็ตของสรรพสิ่ง",
      nameEn: "Embedded Systems & IoT",
      icon: "bi-hdd-network",
      color: "#38B900",
      descTh: "ไมโครคอนโทรลเลอร์, การประมวลผลที่อุปกรณ์ขอบ (Edge Computing), เครือข่ายเซนเซอร์ไร้สาย, สมาร์ตซิตี้ และเกษตรอัจฉริยะ",
      descEn: "Edge Computing, Microcontroller Applications, Wireless Sensor Networks, Smart Home/City Architectures, and Industrial IoT",
      subtopics: [
        "Edge AI on Embedded Hardware",
        "Low-Power IoT Communication (LoRa, BLE, Zigbee)",
        "Smart Agriculture & Environmental Monitoring",
        "Robotics, Actuators & Sensor Integration"
      ]
    },
    {
      id: "hci",
      code: "Track 5",
      nameTh: "ปฏิสัมพันธ์ระหว่างมนุษย์และคอมพิวเตอร์",
      nameEn: "Human-Computer Interaction",
      icon: "bi-person-workspace",
      color: "#4B78BC",
      descTh: "การออกแบบประสบการณ์ผู้ใช้ (UX/UI), ความเป็นจริงเสมือนและความเป็นจริงเสริม (VR/AR), เทคโนโลยีสิ่งอำนวยความสะดวก และการประเมินความสามารถในการใช้งาน",
      descEn: "User Experience (UX) Research, Accessible Computing, Augmented & Virtual Reality (AR/VR), Multimodal Interfaces, and Usability Evaluation",
      subtopics: [
        "Assistive Technologies for Accessibility",
        "Augmented Reality & Mixed Reality Environments",
        "User Interface Design & Cognitive Psychology",
        "Voice, Gesture & Multimodal Interaction"
      ]
    },
    {
      id: "intelligent-systems",
      code: "Track 6",
      nameTh: "ระบบคอมพิวเตอร์อัจฉริยะ",
      nameEn: "Intelligent Computing Systems",
      icon: "bi-diagram-3",
      color: "#083965",
      descTh: "ระบบอัตโนมัติ, ระบบสนับสนุนการตัดสินใจ, ระบบขับขี่อัตโนมัติ, และการบูรณาการเทคโนโลยีเพื่อการประยุกต์ใช้งานในภาคอุตสาหกรรม",
      descEn: "Autonomous Systems, Decision Support Systems, Cyber-Physical Systems, Smart Automation, and Industrial Informatics",
      subtopics: [
        "Autonomous Navigation & Robotics Control",
        "Intelligent Decision Support Systems",
        "Digital Twin & Cyber-Physical Systems",
        "Energy-Aware Computing & Green Tech"
      ]
    }
  ],

  // 9-Week Roadmap (แผนงาน 9 สัปดาห์)
  roadmap: [
    {
      week: 1,
      nameTh: "เริ่มต้นโครงการ (Kickoff)",
      nameEn: "Kickoff",
      descTh: "เปิดรายวิชาสัมมนา ชี้แจงเป้าหมาย mini-conference แบ่งบทบาทหน้าที่ทีมงาน และกำหนดวัตถุประสงค์งานประชุม",
      status: "completed",
      deliverableTh: "รายชื่อโครงสร้างทีมงาน และการเลือกหัวข้อวิจัยเบื้องต้น"
    },
    {
      week: 2,
      nameTh: "พัฒนาบทความวิจัย (Research Paper Development)",
      nameEn: "Research Paper Development",
      descTh: "นักศึกษาค้นคว้า ศึกษาเอกสารและงานวิจัยที่เกี่ยวข้อง (Literature Review) เริ่มเขียนโครงร่างและวิธีดำเนินการวิจัย",
      status: "completed",
      deliverableTh: "โครงร่างบทความวิจัย (Draft Paper Proposal)"
    },
    {
      week: 3,
      nameTh: "ประกาศ CFP และนโยบายการรีวิว (CFP & Review Policy)",
      nameEn: "CFP and Review Policy",
      descTh: "ทีมวิชาการและทีมประชาสัมพันธ์ร่วมกันออกประกาศ Call for Papers กำหนดเกณฑ์การให้คะแนนและนโยบาย Double-Blind Review",
      status: "active",
      deliverableTh: "เอกสาร CFP ทางการ เกณฑ์การให้คะแนน และเทมเพลตบทความ"
    },
    {
      week: 4,
      nameTh: "จัดทำเว็บไซต์และระบบส่งบทความ (Website & Submission System)",
      nameEn: "Website and Submission System",
      descTh: "ทีมเว็บไซต์พัฒนาและเปิดใช้งานเว็บไซต์งานประชุม รองรับการสืบค้นข้อมูล กำหนดการ และเปิดช่องทางส่งบทความออนไลน์",
      status: "active",
      deliverableTh: "เว็บไซต์งานประชุม Mini-Conference ใช้งานได้สมบูรณ์"
    },
    {
      week: 5,
      nameTh: "เตรียมการกระบวนการพิจารณาบทความ (Peer Review Preparation)",
      nameEn: "Peer Review Preparation",
      descTh: "จัดเตรียมนักศึกษาและคณะกรรมการรีวิวบทความ จัดทำแบบฟอร์มประเมิน และซักซ้อมกระบวนการ Peer Review",
      status: "upcoming",
      deliverableTh: "แบบฟอร์ม Review Form และการจับคู่ผู้ประเมินบทความ"
    },
    {
      week: 6,
      nameTh: "ปิดรับบทความและฝึกทักษะการนำเสนอ (Submission Deadline & Presentation Skills)",
      nameEn: "Submission Deadline and Presentation Skills",
      descTh: "ถึงกำหนดปิดรับ Full Paper นักศึกษาเริ่มส่งบทความ พร้อมอบรมเชิงปฏิบัติการเทคนิคการนำเสนอ Oral และการจัดทำ Poster",
      status: "upcoming",
      deliverableTh: "บทความวิจัยฉบับสมบูรณ์ครบ 14 เรื่องเข้าสู่ระบบ"
    },
    {
      week: 7,
      nameTh: "ประชุมตัดสินบทความ (PC Meeting & Decisions)",
      nameEn: "PC Meeting and Decisions",
      descTh: "คณะกรรมการ Technical Program Committee ประชุมสรุปผลการรีวิว ตัดสินคัดเลือก 4 Oral และ 10 Poster แจ้งผลแก่นักศึกษา",
      status: "upcoming",
      deliverableTh: "ผลการพิจารณาตอบรับบทความ (Acceptance Notifications)"
    },
    {
      week: 8,
      nameTh: "เตรียมการขั้นสุดท้ายและซักซ้อม (Final Preparation & Rehearsal)",
      nameEn: "Final Preparation and Rehearsal",
      descTh: "รวบรวม Camera-Ready จัดพิมพ์ Proceedings ตรวจสอบสถานที่ ระบบโสตทัศนูปกรณ์ และซักซ้อมเสมือนจริง (Dry Run)",
      status: "upcoming",
      deliverableTh: "เล่ม Proceedings ฉบับสมบูรณ์ สไลด์ และโปสเตอร์พร้อมจัดแสดง"
    },
    {
      week: 9,
      nameTh: "วันจัดงานประชุมวิชาการ (Mini-Conference Day)",
      nameEn: "Mini-Conference Day",
      descTh: "วันจัดงานจริง นำเสนอแบบ Oral 4 บทความ และ Poster 10 บทความ มอบรางวัล Best Paper และประกาศนียบัตร",
      status: "highlight",
      deliverableTh: "งานประชุมวิชาการสำเร็จลุล่วง เผยแพร่สูติบัตรและรายงานสรุปผล"
    }
  ],

  // 6 ทีมจัดงาน (Organizing Teams)
  teams: [
    {
      id: "general-chair",
      titleTh: "ประธานจัดการประชุม",
      titleEn: "General Chair",
      dutyTh: "ประสานงานภาพรวม การบริหารจัดการโครงการ ดูแลการทำงานของทุกฝ่าย และควบคุมเวลาให้เป็นไปตาม Roadmap",
      dutyEn: "Overall coordination, project governance, cross-team synchronization, and master timeline management.",
      badge: "ฝ่ายบริหารกลาง",
      members: [
        { name: "---", roleTh: "ประธานจัดการประชุม (General Chair)", roleEn: "General Chair" },
        { name: "---", roleTh: "รองประธานจัดการประชุม (Co-Chair)", roleEn: "Co-Chair" },
        { name: "[อาจารย์ที่ปรึกษารายวิชา]", roleTh: "อาจารย์ที่ปรึกษาโครงการ", roleEn: "Faculty Advisor" }
      ]
    },
    {
      id: "tpc",
      titleTh: "คณะกรรมการฝ่ายวิชาการและโปรแกรม",
      titleEn: "Technical Program Committee (TPC)",
      dutyTh: "บริหารจัดการกระบวนการ Peer Review, คัดเลือกบทความ, วางแผนโปรแกรมการนำเสนอ และจัดสรรเซสชัน Oral/Poster",
      dutyEn: "Peer review workflow management, paper review assignment, quality control, and technical session allocation.",
      badge: "ฝ่ายวิชาการ",
      members: [
        { name: "---", roleTh: "ประธานฝ่ายวิชาการ (TPC Chair)", roleEn: "TPC Chair" },
        { name: "---", roleTh: "กรรมการฝ่ายพิจารณาบทความ", roleEn: "Review Coordinator" },
        { name: "---", roleTh: "กรรมการฝ่ายจัดตารางการนำเสนอ", roleEn: "Program Coordinator" }
      ]
    },
    {
      id: "publication",
      titleTh: "คณะกรรมการฝ่ายสิ่งพิมพ์และรายงานการประชุม",
      titleEn: "Publication Team",
      dutyTh: "จัดทำเทมเพลตบทความวิจัย (.docx, .tex), ตรวจสอบความถูกต้องของรูปแบบบทความ (Format Check) และรวบรวมเล่มรายงานการประชุม (Proceedings)",
      dutyEn: "Paper templates management, camera-ready format verification, proceedings compilation, and archiving.",
      badge: "ฝ่ายเอกสารและสิ่งพิมพ์",
      members: [
        { name: "---", roleTh: "หัวหน้าฝ่ายสิ่งพิมพ์ (Publication Chair)", roleEn: "Publication Chair" },
        { name: "---", roleTh: "เจ้าหน้าที่ตรวจรูปแบบเอกสาร", roleEn: "Format Editor" },
        { name: "---", roleTh: "ผู้รวบรวมเล่ม Proceedings", roleEn: "Proceedings Compiler" }
      ]
    },
    {
      id: "website-reg",
      titleTh: "คณะกรรมการฝ่ายเว็บไซต์และระบบลงทะเบียน",
      titleEn: "Website & Registration Team",
      dutyTh: "พัฒนาและดูแลเว็บไซต์งานประชุม ปรับปรุงข้อมูล จัดการระบบรับส่งบทความ และระบบลงทะเบียนผู้เข้าร่วมงาน",
      dutyEn: "Conference website development & maintenance, digital submission workflow, and attendee registration system.",
      badge: "ฝ่ายเทคโนโลยีสารสนเทศ",
      members: [
        { name: "---", roleTh: "หัวหน้าฝ่ายพัฒนาระบบ (Webmaster & Tech Lead)", roleEn: "Webmaster & Tech Lead" },
        { name: "---", roleTh: "ผู้ดูแลระบบลงทะเบียน", roleEn: "Registration Officer" },
        { name: "---", roleTh: "ผู้ดูแลฐานข้อมูลบทความ", roleEn: "Data & Submission Manager" }
      ]
    },
    {
      id: "publicity-design",
      titleTh: "คณะกรรมการฝ่ายประชาสัมพันธ์และออกแบบ",
      titleEn: "Publicity & Design Team",
      dutyTh: "ออกแบบอัตลักษณ์งาน (CI/Branding), โปสเตอร์ประชาสัมพันธ์, สูติบัตร, ป้ายชื่อ, แบ็กดรอป และการสื่อสารผ่านสื่อสังคมออนไลน์",
      dutyEn: "Conference branding & identity, promotional banners, certificate design, name tags, and social media outreach.",
      badge: "ฝ่ายสร้างสรรค์และประชาสัมพันธ์",
      members: [
        { name: "---", roleTh: "หัวหน้าฝ่ายออกแบบและอัตลักษณ์ (Design Lead)", roleEn: "Publicity & Design Lead" },
        { name: "---", roleTh: "นักออกแบบสื่อประชาสัมพันธ์", roleEn: "Graphic & Media Specialist" },
        { name: "---", roleTh: "ผู้ประสานงานประชาสัมพันธ์", roleEn: "Social Media Coordinator" }
      ]
    },
    {
      id: "venue-logistics",
      titleTh: "คณะกรรมการฝ่ายสถานที่และโสตทัศนูปกรณ์",
      titleEn: "Venue & Logistics Team",
      dutyTh: "จัดเตรียมห้องประชุม, บอร์ดแสดงโปสเตอร์ 10 บอร์ด, ระบบเสียง ไมโครโฟน โปรเจกเตอร์, ของว่างและอาหารกลางวัน",
      dutyEn: "Auditorium & room arrangement, 10 poster display boards, audio/visual setup, catering, and on-site logistics.",
      badge: "ฝ่ายสถานที่และบริการ",
      members: [
        { name: "---", roleTh: "หัวหน้าฝ่ายสถานที่ (Logistics Lead)", roleEn: "Logistics Lead" },
        { name: "---", roleTh: "เจ้าหน้าที่ควบคุมโสตทัศนูปกรณ์", roleEn: "A/V & Equipment Specialist" },
        { name: "---", roleTh: "ผู้ประสานงานอาหารและบริการ", roleEn: "Hospitality & Catering Coordinator" }
      ]
    }
  ],

  // วิทยากรรับเชิญ (Keynote Speakers - Placeholders)
  keynotes: [
    {
      id: "keynote-1",
      nameTh: "[ชื่อ-นามสกุล วิทยากรเกียรติยศ 1]",
      nameEn: "[Keynote Speaker Name 1]",
      positionTh: "[ตำแหน่ง / ผู้เชี่ยวชาญด้านปัญญาประดิษฐ์ สถาบันเทคโนโลยีจิตรลดา]",
      positionEn: "[Distinguished Professor / AI Industry Expert]",
      topicTh: "[หัวข้อบรรยาย: อนาคตของปัญญาประดิษฐ์และบทบาทของวิศวกรคอมพิวเตอร์รุ่นใหม่]",
      topicEn: "[Keynote Topic: Future of Artificial Intelligence and Next-Gen Computer Engineering]",
      timeTh: "09:30 - 10:30 น. (TBA · รอประกาศ)",
      timeEn: "09:30 - 10:30 AM (TBA)",
      status: "TBA · รอประกาศยืนยัน",
      bioTh: "วิทยากรผู้ทรงคุณวุฒิที่มีความเชี่ยวชาญและผลงานวิจัยระดับแนวหน้า เพื่อสร้างแรงบันดาลใจแก่นักศึกษาในรายวิชาสัมมนา",
      bioEn: "Distinguished researcher with proven breakthroughs in intelligent systems, invited to inspire students and participants."
    },
    {
      id: "keynote-2",
      nameTh: "[ชื่อ-นามสกุล วิทยากรเกียรติยศ 2]",
      nameEn: "[Keynote Speaker Name 2]",
      positionTh: "[ผู้เชี่ยวชาญจากภาคอุตสาหกรรมเทคโนโลยีสารสนเทศ]",
      positionEn: "[Industry Tech Lead & Cybersecurity Specialist]",
      topicTh: "[หัวข้อบรรยาย: ความมั่นคงปลอดภัยไซเบอร์และนวัตกรรมระบบคลาวด์ในยุคเศรษฐกิจดิจิทัล]",
      topicEn: "[Keynote Topic: Cybersecurity Challenges & Cloud Innovation in the Digital Economy]",
      timeTh: "ช่วงบ่าย (TBA · รอประกาศ)",
      timeEn: "Afternoon Session (TBA)",
      status: "TBA · รอประกาศยืนยัน",
      bioTh: "ผู้เชี่ยวชาญจากภาคอุตสาหกรรมร่วมแลกเปลี่ยนประสบการณ์จริงในการพัฒนานวัตกรรมซอฟต์แวร์และความปลอดภัยไซเบอร์",
      bioEn: "Industry veteran sharing real-world insights on enterprise cloud deployment and modern cyber resilience."
    }
  ],

  // ขั้นตอนกระบวนการทำงาน (Conference Workflow Pipeline)
  workflow: [
    { step: 1, nameTh: "ประกาศรับบทความ", nameEn: "CFP", descTh: "ประชาสัมพันธ์เกณฑ์และขอบเขตหัวข้อวิจัย" },
    { step: 2, nameTh: "ส่งบทความวิจัย", nameEn: "Submission", descTh: "นักศึกษา 14 คนส่งต้นฉบับบทความ" },
    { step: 3, nameTh: "ตรวจประเมินบทความ", nameEn: "Peer Review", descTh: "พิจารณาโดยคณะผู้ทรงคุณวุฒิและเพื่อนนักศึกษา" },
    { step: 4, nameTh: "ประชุมตัดสิน", nameEn: "PC Meeting", descTh: "สรุปผลคัดเลือก 4 Oral และ 10 Poster" },
    { step: 5, nameTh: "แจ้งผลพิจารณา", nameEn: "Acceptance", descTh: "ส่งผลประเมินและข้อเสนอแนะในการปรับปรุง" },
    { step: 6, nameTh: "ส่งฉบับสมบูรณ์", nameEn: "Camera-Ready", descTh: "ปรับแก้ตามคำแนะนำและส่งฉบับตีพิมพ์" },
    { step: 7, nameTh: "จัดทำกำหนดการ", nameEn: "Program", descTh: "เผยแพร่วาระการประชุมและสูติบัตร" },
    { step: 8, nameTh: "วันจัดงานประชุม", nameEn: "Conference Day", descTh: "นำเสนอผลงานจริงและมอบรางวัล Best Paper" },
    { step: 9, nameTh: "รายงานการประชุม", nameEn: "Proceedings", descTh: "รวบรวมเล่ม Proceeding เผยแพร่สู่ระบบคลังความรู้" }
  ],

  // ตารางกำหนดการวันงาน (Daily Schedule / Timeline)
  schedule: {
    dayLabelTh: "วันงานประชุมวิชาการ (Conference Day)",
    dayLabelEn: "Day 1 - Main Conference",
    dateTh: "TBA · รอประกาศ (สัปดาห์ที่ 9)",
    dateEn: "TBA · Week 9 (To Be Announced)",
    locationTh: "ห้องประชุมใหญ่ อาคาร 60 พรรษา ราชสุดาสมโภช สถาบันเทคโนโลยีจิตรลดา",
    locationEn: "Main Auditorium, 60th Anniversary Building, CDTI",
    sessions: [
      {
        time: "08:30 - 09:00",
        type: "registration",
        badgeTh: "ลงทะเบียน",
        badgeEn: "Registration",
        titleTh: "ลงทะเบียนผู้เข้าร่วมงานและรับเอกสารสูติบัตร",
        titleEn: "Registration & Welcome Refreshments",
        locationTh: "โถงต้อนรับ ชั้น 1",
        locationEn: "Foyer, 1st Floor",
        speakerTh: "ทีม Website & Registration",
        speakerEn: "Registration Desk",
        highlight: false
      },
      {
        time: "09:00 - 09:30",
        type: "ceremony",
        badgeTh: "พิธีเปิด",
        badgeEn: "Opening Ceremony",
        titleTh: "พิธีเปิดการประชุมวิชาการ กล่าวต้อนรับและรายงานวัตถุประสงค์รายวิชาสัมมนา",
        titleEn: "Opening Ceremony & Seminar Objective Report",
        locationTh: "ห้องประชุมใหญ่",
        locationEn: "Main Auditorium",
        speakerTh: "General Chair & อาจารย์ผู้ประสานงานรายวิชา",
        speakerEn: "General Chair & Faculty Advisor",
        highlight: true
      },
      {
        time: "09:30 - 10:30",
        type: "keynote",
        badgeTh: "ปาฐกถาพิเศษ",
        badgeEn: "Keynote Speech",
        titleTh: "[หัวข้อบรรยาย: นวัตกรรมเทคโนโลยีและการวิจัยทางวิศวกรรมคอมพิวเตอร์]",
        titleEn: "[Keynote: Future Horizons in Computer Engineering & Emerging Tech]",
        locationTh: "ห้องประชุมใหญ่",
        locationEn: "Main Auditorium",
        speakerTh: "[ชื่อ-นามสกุล วิทยากรเกียรติยศ 1] (TBA · รอประกาศ)",
        speakerEn: "[Keynote Speaker 1] (TBA)",
        highlight: true
      },
      {
        time: "10:30 - 10:45",
        type: "break",
        badgeTh: "พักรับประทานอาหารว่าง",
        badgeEn: "Coffee Break",
        titleTh: "พักรับประทานของว่างช่วงเช้า และชมนิทรรศการเบื้องต้น",
        titleEn: "Morning Coffee Break & Networking",
        locationTh: "โถงรับประทานอาหารว่าง",
        locationEn: "Networking Lounge",
        speakerTh: "ฝ่าย Venue & Logistics",
        speakerEn: "Logistics Team",
        highlight: false
      },
      {
        time: "10:45 - 12:00",
        type: "oral",
        badgeTh: "การนำเสนอแบบบรรยาย (Oral)",
        badgeEn: "Oral Presentation Session",
        titleTh: "การนำเสนอผลงานทางวิชาการแบบ Oral (4 บทความที่ได้รับการคัดเลือก)",
        titleEn: "Technical Oral Session (4 Selected Papers — 15 mins per paper + Q&A)",
        locationTh: "ห้องประชุมใหญ่",
        locationEn: "Main Auditorium",
        speakerTh: "ผู้นำเสนอ 4 ท่าน (Oral #1 - #4) · ดำเนินการโดย TPC",
        speakerEn: "4 Authors (Oral #1 - #4) · Moderated by TPC",
        highlight: true,
        papers: [
          { code: "O-01", titleTh: "[ชื่อบทความวิจัย Oral 1 ด้าน AI & Data Science]", titleEn: "[Oral Paper 1: AI & Data Science Innovation]" },
          { code: "O-02", titleTh: "[ชื่อบทความวิจัย Oral 2 ด้าน Software Engineering]", titleEn: "[Oral Paper 2: Modern Cloud Software System]" },
          { code: "O-03", titleTh: "[ชื่อบทความวิจัย Oral 3 ด้าน Cybersecurity / Network]", titleEn: "[Oral Paper 3: Next-Gen Network Defense]" },
          { code: "O-04", titleTh: "[ชื่อบทความวิจัย Oral 4 ด้าน IoT & Embedded Systems]", titleEn: "[Oral Paper 4: Edge IoT & Smart Application]" }
        ]
      },
      {
        time: "12:00 - 13:00",
        type: "lunch",
        badgeTh: "พักรับประทานอาหารกลางวัน",
        badgeEn: "Lunch Break",
        titleTh: "พักรับประทานอาหารกลางวันและแลกเปลี่ยนความเห็นทางวิชาการ",
        titleEn: "Networking Lunch & Informal Discussions",
        locationTh: "ห้องอาหารสถาบันเทคโนโลยีจิตรลดา",
        locationEn: "CDTI Cafeteria",
        speakerTh: "ฝ่าย Venue & Logistics",
        speakerEn: "Logistics Team",
        highlight: false
      },
      {
        time: "13:00 - 14:30",
        type: "poster",
        badgeTh: "การนำเสนอแบบโปสเตอร์ (Poster)",
        badgeEn: "Poster Presentation Session",
        titleTh: "นิทรรศการและนำเสนอผลงานแบบโปสเตอร์ (10 บทความ)",
        titleEn: "Interactive Poster Exhibition & Demonstration (10 Papers)",
        locationTh: "โถงนิทรรศการ ชั้น 2 (บอร์ด P-01 ถึง P-10)",
        locationEn: "Exhibition Hall, 2nd Floor (Booths P-01 - P-10)",
        speakerTh: "ผู้นำเสนอบทความโปสเตอร์ 10 ท่าน (Poster #1 - #10)",
        speakerEn: "10 Authors (Poster #1 - #10)",
        highlight: true,
        papers: [
          { code: "P-01", titleTh: "[บทความโปสเตอร์ 1: ด้าน Data Analytics ในงานการศึกษา]", titleEn: "[Poster 1: Educational Analytics]" },
          { code: "P-02", titleTh: "[บทความโปสเตอร์ 2: ด้าน Web Application Security]", titleEn: "[Poster 2: Web App Security Benchmark]" },
          { code: "P-03", titleTh: "[บทความโปสเตอร์ 3: ด้าน Smart Sensor for Environment]", titleEn: "[Poster 3: Environmental Sensor Node]" },
          { code: "P-04", titleTh: "[บทความโปสเตอร์ 4: ด้าน Mobile UX Evaluation]", titleEn: "[Poster 4: Mobile Usability Framework]" },
          { code: "P-05", titleTh: "[บทความโปสเตอร์ 5: ด้าน Thai NLP Sentiment Analysis]", titleEn: "[Poster 5: Thai Sentiment Mining]" },
          { code: "P-06", titleTh: "[บทความโปสเตอร์ 6: ด้าน Microservices Automation]", titleEn: "[Poster 6: CI/CD Pipeline Automation]" },
          { code: "P-07", titleTh: "[บทความโปสเตอร์ 7: ด้าน IoT Edge Device Optimization]", titleEn: "[Poster 7: TinyML on Microcontrollers]" },
          { code: "P-08", titleTh: "[บทความโปสเตอร์ 8: ด้าน Intelligent Decision Support]", titleEn: "[Poster 8: Decision Support Tool]" },
          { code: "P-09", titleTh: "[บทความโปสเตอร์ 9: ด้าน Computer Vision for Inspection]", titleEn: "[Poster 9: Automated Optical Inspection]" },
          { code: "P-10", titleTh: "[บทความโปสเตอร์ 10: ด้าน Assistive Computing for Disabled]", titleEn: "[Poster 10: Assistive Interaction Device]" }
        ]
      },
      {
        time: "14:30 - 15:00",
        type: "break",
        badgeTh: "พักรับประทานอาหารว่าง & โหวต",
        badgeEn: "Coffee Break & Voting",
        titleTh: "พักรับประทานของว่างช่วงบ่าย และเปิดให้ผู้เข้าร่วมโหวตผลงานยอดนิยม (Popular Vote)",
        titleEn: "Afternoon Coffee Break & Peer Voting Session",
        locationTh: "โถงรับประทานอาหารว่าง",
        locationEn: "Networking Lounge",
        speakerTh: "ทีม Website & Registration",
        speakerEn: "Website Team",
        highlight: false
      },
      {
        time: "15:00 - 15:45",
        type: "award",
        badgeTh: "พิธีมอบรางวัล",
        badgeEn: "Awards Ceremony",
        titleTh: "การประกาศรางวัล Best Paper Award, Best Presentation Award และ Popular Vote",
        titleEn: "Best Paper, Best Oral Presentation & Popular Vote Awards Ceremony",
        locationTh: "ห้องประชุมใหญ่",
        locationEn: "Main Auditorium",
        speakerTh: "คณะกรรมการตัดสินและอาจารย์ประจำรายวิชา",
        speakerEn: "Judging Committee & Faculty Advisor",
        highlight: true
      },
      {
        time: "15:45 - 16:15",
        type: "closing",
        badgeTh: "พิธีปิดและถ่ายภาพหมู่",
        badgeEn: "Closing & Group Photo",
        titleTh: "กล่าวปิดการประชุมวิชาการ สรุปบทเรียน และถ่ายภาพหมู่เป็นที่ระลึก",
        titleEn: "Closing Remarks, Course Reflection & Commemorative Photo",
        locationTh: "ห้องประชุมใหญ่",
        locationEn: "Main Auditorium",
        speakerTh: "General Chair & คณาจารย์ภาควิชาวิศวกรรมคอมพิวเตอร์",
        speakerEn: "General Chair & Faculty Members",
        highlight: false
      }
    ]
  },

  // กฎบัตรและหลักการงานประชุม (Conference Charter)
  charter: {
    missionTh: "รายวิชาสัมมนา 300-1412 Seminar in CPE มุ่งเน้นการจำลองสภาพแวดล้อมทางวิชาการระดับสากล เพื่อให้นักศึกษาวิศวกรรมคอมพิวเตอร์ได้ฝึกฝนทักษะการวิจัย การเขียนบทความวิชาการ การพิจารณาบทความของผู้อื่น (Peer Review) และการนำเสนอผลงานสู่สาธารณชนอย่างมืออาชีพ",
    missionEn: "The 300-1412 Seminar in CPE course simulates an authentic academic conference environment, training computer engineering students in rigorous research methodologies, scholarly writing, double-blind peer reviews, and public technical presentations.",
    principles: [
      {
        titleTh: "ความซื่อสัตย์และจริยธรรมทางวิชาการ (Academic Integrity)",
        titleEn: "Academic Integrity & Ethics",
        descTh: "ยึดมั่นในความซื่อสัตย์ทางวิชาการ ปราศจากการคัดลอกผลงาน (Plagiarism) และอ้างอิงแหล่งที่มาของข้อมูลอย่างถูกต้องทุกจุด"
      },
      {
        titleTh: "กระบวนการตรวจประเมินอย่างเป็นธรรม (Double-Blind Peer Review)",
        titleEn: "Fair & Rigorous Peer Review",
        descTh: "ทุกบทความได้รับการพิจารณาโดยไม่เปิดเผยชื่อผู้แต่งและผู้ประเมิน เพื่อให้ได้รับข้อเสนอแนะที่สร้างสรรค์และยุติธรรม"
      },
      {
        titleTh: "การทำงานเป็นทีมและการบริหารจัดการ (Student-Led Governance)",
        titleEn: "Collaborative Student Governance",
        descTh: "นักศึกษาทุกคนมีส่วนร่วมในการขับเคลื่อนองค์กรผ่าน 6 ทีมงานหลักตามมาตรฐานสมาคมวิชาการสากล"
      },
      {
        titleTh: "การเปิดกว้างและการแลกเปลี่ยนเรียนรู้ (Open Knowledge Sharing)",
        titleEn: "Open Scholarly Exchange",
        descTh: "เผยแพร่องค์ความรู้สู่สาธารณะเพื่อสร้างประโยชน์แก่วงการวิศวกรรมคอมพิวเตอร์และสังคมดิจิทัล"
      }
    ]
  },

  // ข้อมูลสถานที่จัดงาน (Venue & Logistics)
  venue: {
    titleTh: "สถาบันเทคโนโลยีจิตรลดา (CDTI)",
    titleEn: "Chitralada Technology Institute (CDTI)",
    buildingTh: "อาคาร 60 พรรษา ราชสุดาสมโภช",
    buildingEn: "60th Anniversary Building (Chitralada Royal Villa Campus)",
    addressTh: "สำนักพระราชวัง สนามเสือป่า ถนนศรีอยุธยา แขวงดุสิต เขตดุสิต กรุงเทพมหานคร 10300",
    addressEn: "Bureau of the Royal Household, Sanam Suea Pa, Si Ayutthaya Road, Dusit, Bangkok 10300, Thailand",
    roomsTh: "ห้องประชุมใหญ่ ชั้น 4 (Oral) และ โถงนิทรรศการ ชั้น 2 (Poster)",
    roomsEn: "Main Auditorium 4th Fl. (Oral) & Exhibition Hall 2nd Fl. (Poster)",
    transportation: [
      {
        modeTh: "รถไฟฟ้า BTS",
        modeEn: "BTS Skytrain",
        descTh: "ลงสถานีอนุสาวรีย์ชัยสมรภูมิ (ทางออก 3 หรือ 4) หรือสถานีพญาไท แล้วต่อรถโดยสารประจำทางหรือแท็กซี่เข้าสู่สนามเสือป่า (ประมาณ 10-15 นาที)",
        descEn: "Take BTS to Victory Monument Station (Exit 3/4) or Phaya Thai Station, then transfer to a bus or taxi to Sanam Suea Pa (approx. 10-15 mins)."
      },
      {
        modeTh: "รถไฟฟ้า MRT",
        modeEn: "MRT Subway",
        descTh: "ลงสถานีสนามไชย หรือสถานีบางโพ แล้วต่อรถโดยสารประจำทางสายที่ผ่านถนนศรีอยุธยา / สวนอัมพร",
        descEn: "Alight at Sanam Chai or Bang Pho Station, then take a connecting city bus passing Si Ayutthaya Road."
      },
      {
        modeTh: "รถโดยสารประจำทาง (ขสมก.)",
        modeEn: "Public Bus",
        descTh: "สาย 70, 72, 28, 515, 108, 18, 539 และสายที่ผ่านบริเวณลานพระบรมรูปทรงม้าและสนามเสือป่า",
        descEn: "Bus lines 70, 72, 28, 515, 108, 18, 539 and routes passing Dusit Palace / Royal Plaza area."
      },
      {
        modeTh: "รถยนต์ส่วนบุคคลและที่จอดรถ",
        modeEn: "Personal Car & Parking",
        descTh: "มีพื้นที่จอดรถภายในบริเวณสถาบันเทคโนโลยีจิตรลดาและสนามเสือป่า (กรุณาแสดงบัตรประจำตัวผู้เข้าร่วมงานประชุมเพื่อความสะดวกในการเข้าพื้นที่)",
        descEn: "Designated visitor parking is available within CDTI and Sanam Suea Pa grounds upon showing conference pass."
      }
    ]
  },

  // ข้อมูลการติดต่อ (Contact Info)
  contact: {
    facultyAdvisorTh: "[ชื่ออาจารย์ผู้ประสานงานรายวิชา]",
    facultyAdvisorEn: "[Course Coordinator / Faculty Advisor]",
    generalChairTh: "[ชื่อประธานจัดการประชุม]",
    generalChairEn: "[General Chair Name]",
    email: "cpe-seminar@cdti.ac.th",
    phone: "02-288-8888 ต่อ [เบอร์โทรภายในสาขา]",
    officeTh: "สาขาวิชาวิศวกรรมคอมพิวเตอร์ คณะเทคโนโลยีดิจิทัล อาคาร 60 พรรษา สถาบันเทคโนโลยีจิตรลดา",
    officeEn: "Department of Computer Engineering, Faculty of Digital Technology, 60th Anniversary Building, CDTI",
    facebook: "https://www.facebook.com/CDTIofficial",
    github: "https://github.com/cdti-cpe"
  },

  // ข้อมูลหน้า Archive (การจัดงานในอดีต)
  archives: [
    {
      year: "2024",
      titleTh: "งานประชุมวิชาการสัมมนาวิศวกรรมคอมพิวเตอร์ ประจำปีการศึกษา 2567",
      titleEn: "The 2024 CDTI Seminar in CPE Student Symposium",
      themeTh: "เทคโนโลยีคลาวด์และวิทยาการข้อมูลสำหรับองค์กรยุคใหม่",
      themeEn: "Cloud Technologies & Data Intelligence for Modern Enterprises",
      papersCount: "12 บทความ",
      oralCount: "4 บทความ",
      posterCount: "8 บทความ",
      proceedingsFile: "#download-proceedings-2024-placeholder"
    },
    {
      year: "2023",
      titleTh: "งานประชุมวิชาการสัมมนาวิศวกรรมคอมพิวเตอร์ ประจำปีการศึกษา 2566",
      titleEn: "The 2023 CDTI Seminar in CPE Student Symposium",
      themeTh: "ระบบอินเทอร์เน็ตของสรรพสิ่งและความมั่นคงปลอดภัยโครงสร้างพื้นฐาน",
      themeEn: "Internet of Things & Critical Infrastructure Cybersecurity",
      papersCount: "10 บทความ",
      oralCount: "3 บทความ",
      posterCount: "7 บทความ",
      proceedingsFile: "#download-proceedings-2023-placeholder"
    }
  ],

  // แนวทางการส่งบทความ (Submission Guidelines)
  guidelines: {
    paperFormatTh: "บทความวิจัยความยาว 4-6 หน้า (Oral) และ 2-4 หน้า (Poster) รูปแบบคอลัมน์คู่ตามเทมเพลตมาตรฐาน IEEE / CDTI Seminar",
    paperFormatEn: "Full paper length: 4-6 pages for Oral presentations, 2-4 pages for Poster presentations, standard 2-column format.",
    languageTh: "บทความสามารถเขียนเป็นภาษาไทยหรือภาษาอังกฤษ (พร้อมบทคัดย่อภาษาอังกฤษเสมอ)",
    languageEn: "Papers may be written in Thai or English (English abstract is mandatory).",
    blindPolicyTh: "การส่งบทความรอบแรกต้องลบชื่อผู้แต่ง สถาบัน และข้อมูลที่ระบุตัวตนออกทั้งหมด (Double-Blind Review)",
    blindPolicyEn: "Initial submissions must be completely anonymized for double-blind peer review.",
    templates: [
      { name: "CDTI Seminar LaTeX Template (.zip)", type: "LaTeX", size: "1.2 MB", link: "#download-latex-template-placeholder" },
      { name: "CDTI Seminar MS-Word Template (.docx)", type: "Word", size: "280 KB", link: "#download-word-template-placeholder" },
      { name: "Poster Presentation Template (.pptx)", type: "PowerPoint", size: "4.5 MB", link: "#download-poster-template-placeholder" },
      { name: "Oral Presentation Slide Template (.pptx)", type: "PowerPoint", size: "3.8 MB", link: "#download-slides-template-placeholder" }
    ]
  }
};

// รองรับทั้งการโหลดผ่านเบราว์เซอร์ (window.CONFERENCE_DATA) และ Node.js (CommonJS)
if (typeof module !== "undefined" && module.exports) {
  module.exports = CONFERENCE_DATA;
} else if (typeof window !== "undefined") {
  window.CONFERENCE_DATA = CONFERENCE_DATA;
}
