<div align="center">

# 🪓 CableHunt Networks
### *Smarter optical diagnostics and 40G line-rates — without digging up the high street.*

[![GitHub Stars](https://img.shields.io/github/stars/sassil70/cablehunt?style=flat-square&logo=github&color=F7941D)](https://github.com/sassil70/cablehunt/stargazers)
[![Hugging Face](https://img.shields.io/badge/Hugging%20Face-Optical%20AI%20(In%20Safety%20Staging)-FFD21E?style=flat-square&logo=huggingface&logoColor=black)](https://huggingface.co/sassil70/cablehunt-optical-ai)
[![Open Source Date](https://img.shields.io/badge/Open%20Source-Sept%202027-blue?style=flat-square)](LICENSE.md)
[![License](https://img.shields.io/badge/License-Private%20Use%20Only-yellow?style=flat-square)](LICENSE.md)
[![Live Demo](https://img.shields.io/badge/Live%20Demo-GitHub%20Pages-brightgreen?style=flat-square&logo=github)](https://sassil70.github.io/cablehunt/)
[![UK Endorsed](https://img.shields.io/badge/UK%20Innovator%20Founder-Envestors%20FCA-0052CC?style=flat-square)](https://www.cablehunt.co.uk)

<br/>

[**Live Demo**](https://sassil70.github.io/cablehunt/) • [**Official Site**](https://www.cablehunt.co.uk) • [**Hugging Face Hub**](https://huggingface.co/sassil70/cablehunt-optical-ai) • [**The 4 Pillars**](#-the-four-bits-that-actually-matter) • [**Why Sept 2027?**](#-the-open-source-plan-september-2027) • [**Say Hello**](#-the-people-behind-this)

</div>

---

### What on earth is CableHunt?

If you have ever spent a wet Tuesday morning in a muddy roadside cabinet trying to diagnose a dying optical link, you already know our pain.

For the last forty years, physical optical testing has been bloody slow and mostly passive:
1. A customer rings up screaming because packets are dropping.
2. A tech hops in a van with an ancient 8-bit OTDR that weighs as much as a bowling ball.
3. You squint at a jagged, staircase-looking trace on a tiny screen, trying to figure out if that tiny blip is a bad splice, a speck of dust, or just ADC sampling noise.
4. And if the customer wants 40G instead of 1G? Tough luck. You usually have to wait six months for council permits and spend £120,000 per kilometre tearing up tarmac to pull fresh glass.

We got tired of that nonsense. 

**CableHunt** is a hardware + software project we designed in the UK to do two things really well:
1. **Show you what is *actually* happening inside the glass** at 16x finer resolution than standard field tools.
2. **Upgrade existing brownfield 1G single-mode links to 40G** purely using clever digital signal processing and wavelength tuning — no trenching, no council permits, and no noisy diggers outside anyone's window.

---

### 💡 The Four Bits That Actually Matter

Here is the tech explained without the corporate marketing waffle:

#### 1. 12-Bit Native Sampling (Goodbye, ugly 8-bit staircases)
Most field OTDRs still use old 8-bit converters. That gives you 256 discrete vertical steps. When light bounces back from deep inside a 20 km fibre run (Rayleigh backscatter), the signal is tiny — fractions of a millivolt. An 8-bit scope rounds it off, leaving you with ugly blocky steps.

We sample natively at **12-bit (4,096 discrete steps)**. 
- That is **16 times cleaner resolution**.
- You can spot microscopic microbends and gradual connector rot down to **0.05 dB**.
- The event dead zone drops under **0.8 metres**, so if someone pinched a patch lead right behind the patch panel, you see it straight away instead of guessing.

#### 2. The 1G-to-40G Multiplier (The "save your budget" trick)
Normally, upgrading legacy single-mode fibre (G.652) to higher line-rates runs straight into chromatic dispersion and optical signal-to-noise limits. 

Instead of ripping out the glass, we model the exact transfer function of your existing link in software. By applying dynamic dispersion compensation and allocating clean slices across the ITU-T grid (O, C, and L bands), we pump **40G line-rate across the exact same old fibres**. It cuts roughly 80% to 88% off the cost of an infrastructure upgrade. Your finance director might actually smile for once.

#### 3. Sub-50ms Self-Healing (Before the NOC gets angry)
Finding a fault is nice, but fixing it before customers notice is better. 

Our engine connects straight to your core switches (Cisco, Arista, MikroTik) over Python Netmiko / SSH. When the 12-bit sensor notices an optical link fading or taking physical stress, it doesn't just send a sad email. It triggers an automated protection switch and re-routes the critical wavelength onto a backup path in **under 50 milliseconds**. Zero dropped calls, zero drama.

#### 4. The Handheld Field Unit
We squeezed both dual-domain TDR (for copper/hybrid lines) and 12-bit OTDR into an aluminium handheld box that runs on batteries, laughs at a bit of British drizzle, and includes a small camera to inspect ferrule ends for greasy fingerprints.

---

### 🤖 What About the Hugging Face AI Model?

You probably spotted the badge above pointing to our Hugging Face repository:  
👉 **[https://huggingface.co/sassil70/cablehunt-optical-ai](https://huggingface.co/sassil70/cablehunt-optical-ai)** *(under the `sassil70` account)*

#### Why are the weights not public today?
An honest answer: **Safety and physical-layer responsibility.**

This is not a toy chatbot generating silly poems. The CableHunt model directly calculates laser pump power, wavelength tuning, and switch CLI commands. If a model hallucinates and pumps excessive milliwatts down a dark fibre, you risk blowing out sensitive photodiode receivers or violating Class 1M laser eye-safety regulations. If it misinterprets a reflection pulse, it could flap a core routing trunk.

Right now, we are putting the model through:
- Hard laser power ceiling guardrails.
- Adversarial pulse injection testing (making sure nobody can trick the switch with fake optical spikes).
- Validation against real carrier SOR datasets.

**As soon as the safety and compliance checks are signed off, the full model weights, SOR waveform tokenizers, and synthetic training datasets will be pushed straight to that Hugging Face repository.**

---

### 📅 The Open Source Plan (September 2027)

We want to be completely up-front about how this repo is licensed:

```
    TODAY (2026)                                SEPTEMBER 2027
         │                                            │
         ▼                                            ▼
┌─────────────────────────────────┐        ┌─────────────────────────────────┐
│     PRIVATE & RESEARCH ONLY     │  ===>  │     FULL OPEN SOURCE (FREE)     │
│  Tinker, study, test locally,   │        │  Apache 2.0 / MIT public repo   │
│   academic labs & curiosity.    │        │  Community pull requests open   │
│    (No commercial reselling)    │        │   For every engineer worldwide  │
└─────────────────────────────────┘        └─────────────────────────────────┘
```

- **From now until September 2027:** The software, CAD files, and web app are provided strictly for **private personal use, academic study, and lab evaluation**. Feel free to clone it, spin it up, test the algorithms on your own bench, and benchmark the code. Just please don't take the code to build a commercial product or resell it without having a chat with us first.
- **In September 2027:** The whole lot automatically transitions to a standard, permissive **Open Source License** (Apache 2.0 / MIT). 

Why the delay? Because building physical hardware and lab testbeds in the UK takes real capital. The deferred window lets our startup establish the hardware manufacturing side in Britain while legally guaranteeing that the entire software core belongs to the global community afterwards. Fair play all round.

*(See [LICENSE.md](LICENSE.md) if you want the full legal wording).*

---

### 🚀 Give It a Whirl Locally

You can test the interactive platform right now. It includes a 3D Three.js photonic wave simulation, a real-time 8-bit vs 12-bit comparison slider, an interactive ITU-T spectrum tuner, and a live ROI calculator.

#### Option A: Quick Python Server (Fastest)
```bash
# Clone the repository
git clone https://github.com/sassil70/cablehunt.git
cd cablehunt

# Spin up a local server
python -m http.server 8080
```
Now point your browser to `http://localhost:8080` and have a play.

#### Option B: Docker
If you prefer containers:
```bash
docker build -t cablehunt:local .
docker run -d -p 8080:8080 --name cablehunt-app cablehunt:local
```

#### Option C: Don't feel like cloning anything?
Just open the live build on your phone or laptop:  
👉 **[https://sassil70.github.io/cablehunt/](https://sassil70.github.io/cablehunt/)**

---

### 👥 The People Behind This

We are a small, focused British deep-tech venture backed under the **UK Innovator Founder Framework** (officially endorsed by **Envestors Limited**, regulated by the FCA):

* **Eng. Saleem Asseel** — *Systems Architect & Lead Optical Researcher*  
  Old-school systems engineer (graduated '96). Spends his days wrestling with DSP mathematics, low-level ADC sampling, and making sure packets get where they need to go without digging up streets.  
  Direct contacts: [`assilno1@gmail.com`](mailto:assilno1@gmail.com) • [`saleem@cablehunt.co.uk`](mailto:saleem@cablehunt.co.uk) • [`saleem@cabelhunt.com`](mailto:saleem@cabelhunt.com)
* **Batoul Mowafak Zain Alabdin** — *Chief Executive Officer (CEO)*  
  Steering the company, keeping investors happy, and making sure the business side runs as smoothly as the optics.
* **Ahmad Jalal Asseel** — *Chief Operating Officer (COO)*  
  Managing field trials, kit sourcing, and keeping our UK compliance paperwork spick and span.

---

### 📬 Fancy a Chat or a Cuppa?

Whether you run a data centre, splice glass for a living, or just love clever hardware, we are always up for a sensible technical chat. If you are ever near London or Birmingham, drop us a line and come have a gander at the optical bench in our testbed.

* **Mayfair Executive Hub:** 3rd Floor, 45 Albemarle Street, Mayfair, London, W1S 4JL, UK
* **Registered Office:** 70 Colombo Street, London, SE1 8EE, UK
* **R&D Optical Testbed:** Birmingham, West Midlands, UK
* **General Enquiries:** [`info@cablehunt.co.uk`](mailto:info@cablehunt.co.uk)
* **Partnerships & Field Trials:** [`partners@cablehunt.co.uk`](mailto:partners@cablehunt.co.uk)
* **Website:** [https://www.cablehunt.co.uk](https://www.cablehunt.co.uk)

---

<div align="center">

**If you like what we are building, chuck us a Star ⭐ on GitHub!**  
It helps other engineers find the project and keeps us motivated while soldering boards late into the night. Cheers!

</div>
