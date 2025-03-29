---
language:
  - en
tags:
  - optical-fiber
  - otdr
  - 12-bit-adc
  - 1d-cnn
  - physics-informed-neural-network
  - telecom
  - dwdm
  - time-series
  - predictive-maintenance
  - cablehunt
license: other
license_name: cablehunt-deferred-open-weights-2029
library_name: pytorch
pipeline_tag: time-series-forecasting
---

# 🤗 CableHunt Smart Optical AI (`cablehunt-optical-ai`)
### *Physics-Informed 1D-CNN & Spectral Transformer for 12-Bit Optical Reflectometry & 40G Brownfield Remediation*

[![Scheduled Public Weights Release](https://img.shields.io/badge/Public%20Weights%20Release-Confirmed%202029-10B981?style=flat-square)](https://huggingface.co/sassil/cablehunt-optical-ai)
[![Software Repo](https://img.shields.io/badge/GitHub%20Software%20Stack-Sept%202026%20Open%20Source-F7941D?style=flat-square&logo=github)](https://github.com/sassil70/cablehunt)
[![Official UK Portal](https://img.shields.io/badge/Official%20Portal-cablehunt.co.uk-0052CC?style=flat-square)](https://cablehunt.co.uk)

---

## 1. What is the Idea Behind `cablehunt-optical-ai`?

Every optical network on the planet — from London data-centre rings to rural fibre trunks — suffers from a blind spot at the physical layer.

Conventional Optical Time-Domain Reflectometers (OTDRs) sample backscattered light using **8-bit Analog-to-Digital Converters ($2^8 = 256$ vertical levels)**. At 256 levels, a tiny $-0.08\text{ dB}$ splice rot or a slow moisture creep inside an underground duct gets rounded off into coarse staircase noise. Nobody knows the link is dying until the glass snaps on a rainy night and drops traffic.

**`cablehunt-optical-ai`** is a purpose-built, physics-informed **Smart Optical AI Model** created by **CableHunt Networks Limited** (UK Company No. 16093071) and architected by **Eng. Saleem Asseel**. Instead of looking at blurry 8-bit traces, it ingests **native 12-bit ADC Rayleigh backscatter waveforms ($2^{12} = 4,096$ vertical levels — 16× finer resolution)** across all six ITU-T optical bands ($1260\text{ nm}$ to $1675\text{ nm}$).

### What the Smart Model Does in Real Time:
1. **Sub-Millivolt Fault Classification (<12 ms Inference):** Distinguishes between a degrading fusion splice ($-0.05\text{ dB}$), a physical duct pinch/macrobend, a contaminated ODF SC/APC ferrule (within a $<0.8\text{ m}$ event dead-zone), a ghost reflection, or a clean termination with **>98.4% field accuracy**.
2. **Differential Wavelength Physics ($\Delta\alpha_{1625/1550}$):** By comparing $1550\text{ nm}$ (C-Band) against $1625\text{ nm}/1650\text{ nm}$ (L/U-Band) mode-field leakage, the model knows immediately whether an attenuation dip is caused by thermal laser drift or someone physically bending the cable in a manhole.
3. **3-Week Predictive Failure Horizon:** Tracks temporal slope derivatives across repeated 12-bit scans to predict exactly when a stressed splice will breach the Forward Error Correction (FEC) cliff — alerting engineers **14 to 21 days before an outage**.
4. **1G-to-40G Brownfield Channel Optimiser:** Computes the exact chromatic dispersion compensation and ITU-T channel allocation needed to upgrade legacy **1G brownfield G.652 fibres straight to 40G line-rates** without civil trenching.
5. **Autonomous Sub-50ms Switch Protection:** Generates verified CLI remediation actions via Python **Netmiko** for Cisco IOS-XR, MikroTik RouterOS v7, and Arista EOS switches in **$\approx 38.4\text{ ms}$**.

---

## 2. Model Architecture Overview

```
Raw 12-Bit ADC / Bellcore .SOR Trace (4,096 Vertical Levels, N=1024 Boxcar Averaged)
       │
       ├──► [Stage A: Multi-Scale 1D-CNN Feature Extractor]
       │      • Dilated causal convolutions (kernel sizes: 3, 7, 15, 31)
       │      • Captures sharp Fresnel spikes (<0.8m dead-zone) & gradual Rayleigh slopes
       │
       ├──► [Stage B: Physics-Informed Spectral Attention (PINN Layer)]
       │      • Enforces ITU-T attenuation constraints: α(λ), OH⁻ water peak (1383nm),
       │        and macrobend differential loss (Δα = α_1625nm - α_1550nm)
       │
       └──► [Stage C: Dual Task Heads]
              ├──► 1. Fault Taxonomy & GPS/Distance Localisation (±0.42m precision)
              └──► 2. Remaining Useful Life (RUL) Prognostics & Safe Netmiko Action Policy
```

| Specification | Value |
| :--- | :--- |
| **Model Family** | `CableHunt-Optical-AI-v1` (Hybrid 1D-CNN + Physics-Informed Transformer) |
| **Input Resolution** | 12-Bit Native Quantisation ($4,096$ vertical levels, $72.2\text{ dB}$ SNR) |
| **Spectral Coverage** | $1260\text{ nm} – 1675\text{ nm}$ (ITU-T O, E, S, C, L, and U Bands) |
| **Parameter Count** | $14.8\text{M}$ parameters (FP16 / INT8 quantised for edge FPGA & ARM NPU) |
| **Edge Inference Latency** | $8.4\text{ ms}$ (CH-12B Handheld Unit) / $3.1\text{ ms}$ (Rack Server GPU) |
| **Classification Precision** | $98.4\%$ across 80 km G.652.D & G.657.A1 Birmingham testbed spools |

---

## 3. Confirmed Public Release Schedule: **2029**

We believe in being 100% transparent with the engineering community about our release timeline:

* **September 2026 — Core Software Stack Open-Source:** Our Python 12-bit DSP acquisition suite, Bellcore `.SOR` parser, and Netmiko switch drivers on GitHub ([`sassil70/cablehunt`](https://github.com/sassil70/cablehunt)) become fully Open-Source.
* **2029 — Smart Optical AI Model Public Weights Release (This Repository):** The complete pre-trained weights (`.safetensors`), waveform tokenisers, and anonymised 12-bit `.SOR` benchmark datasets for **`cablehunt-optical-ai`** are **confirmed for open public release in 2029**.

### Why 2029 for the AI Model Weights?
Because `cablehunt-optical-ai` directly governs optical launch power, DWDM channel tuning, and autonomous BGP/MPLS switch failover on live telecommunications infrastructure:
1. **Laser Eye-Safety & Photodiode Protection:** We are completing hardware-locked guardrails so no fine-tuned derivative can command optical power levels that violate **IEC 60825-1 Class 1M** limits or damage remote InGaAs APD receivers.
2. **Adversarial Optical Pulse Hardening:** Ensuring the model cannot be spoofed into triggering false core-network reroutes via injected out-of-band optical pulses.
3. **UK Telecoms Security Act (TSA) & Multi-Winter Validation:** Completing multi-year endurance validation across UK metro ducts (Birmingham, Slough, and London corridors) to ensure zero false-positive flaps on Critical National Infrastructure (CNI).

---

## 4. Engineering Leadership & Direct Contact (`@cablehunt.co.uk`)

For academic collaboration, early carrier pilot evaluation at our **Birmingham 80 km Optical Testbed**, or commercial licensing inquiries prior to the 2029 public weight release:

* **Eng. Saleem Asseel** — *Lead Scientific Advisor & Systems Architect*  
  [`saleem@cablehunt.co.uk`](mailto:saleem@cablehunt.co.uk) • [`saleem@cablehunt.co.uk`](mailto:saleem@cablehunt.co.uk) • [`assilno1@gmail.com`](mailto:assilno1@gmail.com)
* **Ahmad Jalal Assil** — *Chief Operating Officer (COO) & Co-Founder*  
  [`jalal@cablehunt.co.uk`](mailto:jalal@cablehunt.co.uk) • [`jalal@cablehunt.co.uk`](mailto:jalal@cablehunt.co.uk)
* **Batoul Zien Alabdin** — *Chief Executive Officer (CEO)*  
  [`batoul@cablehunt.co.uk`](mailto:batoul@cablehunt.co.uk)
* **Central Corporate & Technical Desk:** [`info@cablehunt.co.uk`](mailto:info@cablehunt.co.uk)
* **Official UK Website:** **[https://cablehunt.co.uk](https://cablehunt.co.uk)**
* **Interactive Digital Twin:** **[https://sassil70.github.io/cablehunt/](https://sassil70.github.io/cablehunt/)**
