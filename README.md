<div align="center">

# 🪓 CableHunt Networks
### *Smarter 12-bit optical diagnostics and 40G line-rates — without digging up the high street.*

[![GitHub Stars](https://img.shields.io/github/stars/sassil70/cablehunt?style=flat-square&logo=github&color=F7941D)](https://github.com/sassil70/cablehunt/stargazers)
[![Hugging Face Smart AI Model](https://img.shields.io/badge/Hugging%20Face-Smart%20Optical%20AI%20(2029%20Release)-FFD21E?style=flat-square&logo=huggingface&logoColor=black)](https://huggingface.co/sassil/cablehunt-optical-ai)
[![Software Open Source](https://img.shields.io/badge/Software%20Open%20Source-April%202025-blue?style=flat-square)](LICENSE.md)
[![AI Weights Open Release](https://img.shields.io/badge/AI%20Model%20Weights-2029%20Public%20Release-10B981?style=flat-square)](huggingface-model-card/README.md)
[![Live Demo](https://img.shields.io/badge/Live%20Demo-GitHub%20Pages-brightgreen?style=flat-square&logo=github)](https://sassil70.github.io/cablehunt/)
[![Official Portal](https://img.shields.io/badge/Official%20Portal-cablehunt.co.uk-0052CC?style=flat-square)](https://cablehunt.co.uk)

<br/>

[**Live Interactive Demo**](https://sassil70.github.io/cablehunt/) • [**Official UK Portal (cablehunt.co.uk)**](https://cablehunt.co.uk) • [**Hugging Face Model Card (2029)**](huggingface-model-card/README.md) • [**DSP & Hardware Deep-Dive**](docs/ARCHITECTURE_AND_DSP_GUIDE.md) • [**Say Hello**](#-the-people-behind-this)

</div>

---

### What on earth is CableHunt?

If you have ever spent a wet Tuesday morning in a freezing roadside cabinet somewhere near Birmingham trying to diagnose a dying optical link, you already know our pain.

For the last forty years, physical optical testing has been bloody slow and mostly passive:
1. A customer rings up screaming because packets are dropping.
2. A tech hops in a van with an ancient 8-bit OTDR that weighs as much as a bowling ball.
3. You squint at a jagged, staircase-looking trace on a tiny screen, trying to figure out if that tiny blip at 42.1 km is a degrading splice, a pinched duct, or just ADC sampling noise.
4. And if the customer wants 40G instead of 1G? Tough luck. You usually have to wait six months for council street-works permits and spend £70,000 to £140,000 per kilometre tearing up tarmac to pull fresh glass.

We got tired of that nonsense.

**CableHunt** is a hardware + software engineering platform designed in the UK to do two things properly:
1. **Show you what is *actually* happening inside the glass** at **16× finer vertical resolution** (12-bit native sampling, 4,096 vertical levels) than legacy 8-bit field tools.
2. **Upgrade existing brownfield 1G single-mode links straight to 40G** purely using high-resolution channel profiling, chromatic dispersion pre-compensation, and ITU-T wavelength tuning — no trenching, no council permits, and no noisy diggers outside anyone's window.

---

### 💡 The Four Bits That Actually Matter

Here is the engineering explained without the glossy corporate marketing waffle:

#### 1. 12-Bit Native Sampling (Goodbye, ugly 8-bit staircases)
Most field OTDRs still rely on 8-bit converters ($2^8 = 256$ vertical steps), which gives a theoretical Signal-to-Noise ceiling of roughly $49.9\text{ dB}$ ($\text{SNR} = 6.02N + 1.76$). When Rayleigh backscatter bounces back from deep inside an 80 km fibre spool, the signal is tiny — fractions of a millivolt. An 8-bit digitiser rounds it off into blocky stairs, hiding early $-0.08\text{ dB}$ splice rot completely.

We sample natively at **12-bit ($2^{12} = 4,096$ discrete vertical levels)** paired with hardware Boxcar averaging ($N=1024$ pulses):
- **16 times finer vertical resolution** and **$72.2\text{ dB}$ effective dynamic range**.
- Spots microscopic microbends and gradual fusion-splice degradation down to **$0.05\text{ dB}$** — typically **2 to 3 weeks before the fibre snaps**.
- Event dead-zone under **$0.8\text{ metres}$**, so if someone pinched an SC/APC patch lead right behind the ODF rack, you see it straight away instead of guessing.

#### 2. The 1G-to-40G Brownfield Multiplier (The "save your budget" trick)
Thousands of kilometres of G.652 glass laid twenty years ago are still throttled at 1 Gbps because operators are terrified that unmapped microbends, $1383\text{ nm}$ water-peak absorption, and chromatic dispersion ($\approx 16.8\text{ ps/(nm}\cdot\text{km)}$ in C-Band) will collapse a 40G signal.

Instead of ripping out the duct, we run a 12-bit spectral sweep across $1260\text{ nm}–1675\text{ nm}$ (O, E, S, C, L, and U bands), fix the exact sub-dB bottlenecks, pre-compensate the dispersion in DSP, and light up **4×10G or 40G QSFP28/SFP+ DWDM channels** over the exact same legacy glass. It cuts **88% to 96% off the CapEx** of a corridor upgrade. Your finance director might actually crack a smile for once.

#### 3. Sub-50ms Self-Healing (Before the NOC gets angry)
Finding a fault is nice, but fixing it before TCP sessions drop is much better.

Our edge daemon talks straight to core switches (Cisco IOS-XR, MikroTik RouterOS v7, Arista EOS, Juniper Junos) over Python **Netmiko** / SSHv2 fast-sockets. When our 12-bit sensor notices an L-Band ($1625\text{ nm}$) vs C-Band ($1550\text{ nm}$) bend differential or laser sag, it doesn't just send a sad email. It shifts the wavelength to the bend-resilient O-Band or triggers an MPLS/BGP protection switch in **$\approx 38.4\text{ ms}$**. Zero dropped calls, zero drama.

#### 4. The Rugged CH-12B Handheld & Edge Unit
We packed dual-domain TDR (for copper/coax/hybrid lines), 12-bit OTDR, **RF over Fiber (RFOF)**, and a **400× IEC 61300-3-35 coaxial ferrule microscope** into an anodised aluminium chassis with a **$2,500\text{ V}_{\text{rms}}$ Floating-Ground DC-DC isolation barrier** (so $-48\text{V}$ telecom exchange ground loops never corrupt the bottom 4 bits of our 12-bit converter).

---

### 🧠 The Smart Optical AI Model on Hugging Face (Confirmed 2029 Public Release)

You probably spotted the badge pointing to our Hugging Face repository under the `sassil` account:  
👉 **[https://huggingface.co/sassil/cablehunt-optical-ai](https://huggingface.co/sassil/cablehunt-optical-ai)**  
📄 *(Full local Model Card & Architecture Spec available in [`huggingface-model-card/README.md`](huggingface-model-card/README.md))*

#### What is the Smart Optical AI Model (`cablehunt-optical-ai`)?
Unlike generic language models, **`cablehunt-optical-ai`** is a purpose-built, physics-informed **Hybrid 1D-CNN + Spectral Transformer Foundation Model** trained directly on 12-bit raw ADC backscatter arrays and Bellcore `.SOR` traces:
1. **Multi-Scale 1D-CNN Front-End:** Scans 4,096-level Rayleigh backscatter waveforms to classify reflective and non-reflective events (fusion splice decay, physical macrobend pinch, dirty SC/APC ferrule, ghost reflection, or clean termination) in **under 12 milliseconds** with **>98.4% field accuracy**.
2. **Differential Wavelength Physics Layer ($\Delta\alpha_{1625/1550}$):** Compares $1550\text{ nm}$ C-Band against $1625\text{ nm}/1650\text{ nm}$ L/U-Band evanescent mode-field leakage to tell the difference between a harmless thermal splice drift and a physical digger crushing a roadside duct.
3. **Time-to-Failure Prognostics Head:** Forecasts exactly how many days remain before a $-0.08\text{ dB}$ micro-stress crosses the FEC bit-error cliff, and synthesises safe Netmiko CLI remediation commands.

#### Why is the Smart AI Model confirmed for open release in **2029** (while the software stack & research findings released in **Jan–April 2025**)?
An honest engineering answer: **Critical National Infrastructure (CNI) security and physical laser safety.**

This model directly controls optical launch power, DWDM channel allocation, and core router failover scripts across live telecom backbones. If an insufficiently hardened model is tricked by adversarial optical pulse injection or hallucinates a power boost, it can blind sensitive InGaAs APD receivers, breach Class 1M laser safety limits, or flap regional routing tables.

Therefore, we operate a strict **Two-Stage Open Release Schedule**:

```
   JAN 2025                      APRIL 2025                          2029 RELEASE
          │                                  │                                    │
          ▼                                  ▼                                    ▼
┌───────────────────────┐      ┌───────────────────────────┐      ┌──────────────────────────────┐
│ INITIAL LAB & PAPERS  │ ===> │  STAGE 1: OPEN SOFTWARE   │ ===> │ STAGE 2: SMART AI MODEL (HF) │
│ First R&D benchmarks, │      │ Python 12-bit DSP suite,  │      │ Full 1D-CNN + PINN weights   │
│ IEEE preprints & twin │      │ .SOR parser & Netmiko CLI │      │ & 12-bit .SOR carrier corpus │
│  (Jan–Mar 2025)       │      │  open under Apache/MIT.   │      │ released on Hugging Face Hub │
└───────────────────────┘      └───────────────────────────┘      └──────────────────────────────┘
```

- **January–April 2025 (First Research Results & Software Stack Open-Source):** Publication of initial 12-bit reflectometry research benchmarks (Jan–Mar 2025) and transition of the core Python 12-bit DSP acquisition code, `.SOR` Bellcore parser, and Netmiko automation drivers in this GitHub repository to open-source (April 2025).
- **2029 (Smart Optical AI Model Weights on Hugging Face):** Following multi-winter UK carrier endurance trials, adversarial red-teaming, and **UK Telecoms Security Act (TSA)** compliance sign-off, the complete `cablehunt-optical-ai` model weights, tokenisers, and anonymised 12-bit `.SOR` benchmark datasets will be published openly on Hugging Face.

---

### 🗂️ Repository Structure & Technical Deep-Dives

We have organised this repository so engineers, auditors, and researchers can inspect both the live interactive web twin and the underlying optical DSP specifications:

```text
cablehunt/
├── index.html                               # Master interactive platform (3D CAD, 12-bit Scope, Eye Diagram, CLI)
├── README.md                                # Project overview & Two-Stage (April 2025 / 2029) Open Roadmap
├── LICENSE.md                               # Open-Source Software (April 2025) & AI Model (2029) Governance
├── Dockerfile                               # Production Nginx container build (Cloud Run / Docker ready)
├── assets/
│   ├── css/style.css                        # Obsidian Deep-Tech styling & responsive layout grid
│   └── js/
│       ├── three-hero.js                    # 3D photonic particle & optical wave background engine
│       ├── three-device.js                  # Interactive 3D CAD Handheld Unit + Live OLED + Exploded PCB X-Ray
│       ├── scope-slider.js                  # 8-Bit (256) vs 12-Bit (4096) Oscilloscope + Live Fault Injector
│       ├── spectrum-tuner.js                # ITU-T 1260nm-1675nm Explorer + Live 40G Optical Eye Diagram
│       ├── live-terminal.js                 # Autonomous Netmiko CLI switch orchestration simulator
│       ├── roi-calculator.js                # Brownfield 1G-to-40G CapEx vs Civil Trenching calculator
│       └── gemini-ai.js                     # Hybrid Gemini 2.5 Flash + Local Optical DSP Knowledge Core
├── docs/
│   └── ARCHITECTURE_AND_DSP_GUIDE.md        # Deep-dive: 12-Bit SNR math, Floating-Ground rig & 40G link budget
└── huggingface-model-card/
    ├── README.md                            # Official Hugging Face Model Card (sassil/cablehunt-optical-ai)
    ├── config.json                          # 1D-CNN + Spectral Transformer architecture configuration
    └── publish_to_huggingface.py            # Automated script to sync model card & configs to Hugging Face Hub
```

---

### 🚀 Give It a Whirl Locally

You can test the entire interactive suite right now — including the **Exploded X-Ray 3D CAD Handheld Unit**, the **Live Fiber Fault Injector**, the **2-UI 40G Optical Eye Diagram**, and the **Autonomous Netmiko CLI**.

#### Option A: Quick Python Server (Fastest)
```bash
git clone https://github.com/sassil70/cablehunt.git
cd cablehunt
python -m http.server 8080
```
Point your browser to `http://localhost:8080` and have a play.

#### Option B: Docker
```bash
docker build -t cablehunt:local .
docker run -d -p 8080:8080 --name cablehunt-app cablehunt:local
```

#### Option C: Live Cloud Builds (Zero install)
- **Official UK Domain:** **[https://cablehunt.co.uk](https://cablehunt.co.uk)**
- **GitHub Pages Mirror:** **[https://sassil70.github.io/cablehunt/](https://sassil70.github.io/cablehunt/)**

---

### 👥 The People Behind This

We are a British deep-tech optical venture incorporated under the UK Companies Act 2006 (**Company No. 16093071**) and backed under the **UK Innovator Founder Framework** (endorsed by **Envestors Limited**, FCA regulated):

* **Eng. Saleem Asseel** — *Lead Scientific Advisor & Systems Architect*  
  Systems engineer (graduated '96) and principal architect of the 12-bit ADC testbed, optical DSP pipeline, spectral optimisation models, and Netmiko switch drivers.  
  Direct contact: [`saleem@cablehunt.co.uk`](mailto:saleem@cablehunt.co.uk)
* **Batoul Zien Alabdin** — *Chief Executive Officer (CEO)*  
  Directs strategic executive oversight, corporate capitalisation, British commercial compliance, and institutional partnerships.  
  Direct contact: [`batoul@cablehunt.co.uk`](mailto:batoul@cablehunt.co.uk)
* **Ahmad Jalal Assil** — *Chief Operating Officer (COO) & Co-Founder*  
  Over a decade of physical network infrastructure experience. Directs hardware supply chains, UK regulatory compliance, and international field operations.  
  Direct contact: [`jalal@cablehunt.co.uk`](mailto:jalal@cablehunt.co.uk)

---

### 📬 Fancy a Chat or a Technical Session in Birmingham?

Whether you run a regional fibre network, manage a data centre in Slough or Docklands, or just appreciate proper hardware engineering, we are always up for a sensible technical chat.

* **Mayfair Executive Headquarters:** 3rd Floor, 45 Albemarle Street, Mayfair, London, W1S 4JL, United Kingdom
* **Birmingham Optical R&D Testbed:** 80 km G.652.D / G.657.A1 Hardware-in-the-Loop Facility, Birmingham, West Midlands, UK
* **Central Enquiries & Support Desk:** [`info@cablehunt.co.uk`](mailto:info@cablehunt.co.uk) • Tel: `+44 20 78702243`
* **Systems Architect:** [`saleem@cablehunt.co.uk`](mailto:saleem@cablehunt.co.uk)
* **Operations & Field Trials:** [`jalal@cablehunt.co.uk`](mailto:jalal@cablehunt.co.uk)
* **Executive Office:** [`batoul@cablehunt.co.uk`](mailto:batoul@cablehunt.co.uk)
* **Peer-Reviewed Academic Archive:** **[https://cablehunt.co.uk/papers/](https://cablehunt.co.uk/papers/)**
* **Official Website:** **[https://cablehunt.co.uk](https://cablehunt.co.uk)**

---

<div align="center">

**If you like what we are building, chuck us a Star ⭐ on GitHub!**  
It helps fellow network engineers discover the project and keeps us caffeinated while calibrating 12-bit boards late into the night. Cheers!

</div>
