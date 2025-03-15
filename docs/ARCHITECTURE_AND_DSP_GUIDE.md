# CableHunt 12-Bit Optical DSP & Hardware Architecture Guide

**Organisation:** CableHunt Networks Limited (UK Company No. 16093071)  
**Official Domain:** [https://cablehunt.co.uk](https://cablehunt.co.uk)  
**Principal Architect:** Eng. Saleem Asseel (`saleem@cablehunt.co.uk`)  
**Operations & Field Validation:** Ahmad Jalal Assil (`jalal@cablehunt.co.uk`)  
**Executive Oversight:** Batoul Zien Alabdin (`batoul@cablehunt.co.uk`)  

---

## 1. Why 8-Bit OTDRs Struggle on Modern Fibre Spans

When a short laser pulse ($\tau = 5\text{ ns} \dots 20\text{ ns}$) travels down an $80\text{ km}$ G.652.D single-mode fibre, only a tiny fraction of light scatters backwards towards the receiver via Rayleigh scattering. By the time that backscatter returns from $40\text{ km}$ away, the optical power at the photodiode is measured in nanowatts.

In a traditional **8-bit OTDR**, the Analog-to-Digital Converter (ADC)slices the entire voltage range into just:

$$L_{8\text{-bit}} = 2^8 = 256\text{ quantisation levels}$$

The theoretical Signal-to-Noise Ratio (SNR) of an ideal $N$-bit converter is:

$$\text{SNR}_{\text{dB}} = 6.02 \cdot N + 1.76\text{ dB}$$

For an 8-bit converter, $\text{SNR}_{\text{8-bit}} \approx 49.92\text{ dB}$ (and closer to $48.1\text{ dB}$ once thermal and front-end amplifier noise are included). Consequently, a gradual **$-0.08\text{ dB}$ fusion splice decay** or early moisture ingress falls inside a single quantisation step and is rounded away completely.

---

## 2. The CableHunt 12-Bit Native + Boxcar DSP Pipeline

CableHunt replaces the 8-bit acquisition stage with a **12-bit native high-speed digitiser**:

$$L_{12\text{-bit}} = 2^{12} = 4,096\text{ quantisation levels} \quad (16\times \text{ finer vertical resolution})$$

This raises the baseline converter ceiling to:

$$\text{SNR}_{\text{12-bit}} = 6.02(12) + 1.76 = 74.00\text{ dB} \quad (+24.08\text{ dB over 8-bit})$$

### Hardware Boxcar Averaging ($N = 1024$)
To push the random thermal noise floor of the InGaAs Transimpedance Amplifier (TIA) even lower without slowing down field diagnostics, the FPGA/DSP core executes real-time synchronous **Boxcar averaging** across $N = 1024$ pulse acquisitions:

$$\Delta\text{SNR}_{\text{avg}} = 10 \log_{10}\left(\sqrt{N}\right) = 5 \log_{10}(1024) \approx +15.05\text{ dB}$$

Combined with our shielded analog front-end, this yields an effective **72.2 dB clean dynamic range** and an event dead-zone of **$< 0.8\text{ metres}$**.

---

## 3. Floating-Ground Isolation ($2,500\text{ V}_{\text{rms}}$)

High-resolution 12-bit conversion is useless if the bottom 4 bits are swamped by $50\text{ Hz}$ mains hum or $-48\text{V DC}$ telecom rectifier switching hash.

In telecom exchanges and data-centre halls, chassis ground potentials between racks frequently differ by several hundred millivolts. Connecting a mains-referenced test instrument directly to an ODF rack creates a ground loop straight through the coaxial shield.

The **CableHunt CH-12B Handheld & Edge Unit** isolates the entire optical analog front-end behind a **$2,500\text{ V}_{\text{rms}}$ galvanically isolated DC-DC barrier** ($>120\text{ dB}$ Common-Mode Rejection Ratio), ensuring a true $0.0\text{ mA}$ ground-loop floor.

---

## 4. The 1G-to-40G Brownfield Speed Multiplier

Across the UK (London Docklands, Slough, Manchester, and Birmingham), thousands of legacy G.652 single-mode fibre runs laid between 1998 and 2010 remain capped at **1 Gbps** because operators assume the old glass cannot sustain 40G line-rates without digging up the road (£70,000–£140,000/km).

CableHunt unlocks **40 Gbps** over those existing fibres in four steps:
1. **12-Bit Micro-Bottleneck Audit:** Identifies and eliminates the exact 2 or 3 high-loss ODF patch leads, dirty SC/APC ferrules, or pinched splice trays along the route (often recovering $1.5\text{ dB} \text{ to } 3.5\text{ dB}$ of lost optical budget in an afternoon).
2. **Multi-Band Spectral Mapping ($1260\text{ nm} – 1675\text{ nm}$):** Maps water-peak absorption ($\text{OH}^-$ ion peak at $1383\text{ nm}$ in the E-Band) and selects the cleanest low-loss transmission windows in the **C-Band ($1530\text{ nm}–1565\text{ nm}$, $0.19\text{ dB/km}$)** or zero-dispersion **O-Band ($1310\text{ nm}$)**.
3. **Chromatic Dispersion Pre-Compensation:** Computes the exact cumulative dispersion ($\approx 16.8\text{ ps/(nm}\cdot\text{km)} \times L$) and configures transceiver DSP pre-emphasis so the 40G optical eye diagram remains wide open ($Q\text{-Factor} > 7.5$, $\text{Pre-FEC BER} < 10^{-12}$).
4. **Continuous 1650nm U-Band Guard Monitoring:** Monitors the upgraded 40G C-Band bearer 24/7 out-of-band at $1650\text{ nm}$ without dropping a single customer packet.

---

## 5. Closed-Loop Netmiko Switch Orchestration (<50ms)

When the **Smart Optical AI Model (`cablehunt-optical-ai`)** detects a severe physical anomaly — such as a digger pinching a duct ($\Delta\alpha = \alpha_{1625\text{nm}} - \alpha_{1550\text{nm}} > 0.5\text{ dB}$) — the edge daemon executes autonomous protection switching in **$<50\text{ ms}$** ($\approx 38.4\text{ ms}$ average on our Birmingham testbed):

- **Supported NOS Platforms:** Cisco IOS-XR / IOS-XE, MikroTik RouterOS v7, Arista EOS, Juniper Junos.
- **Remediation Actions:**
  1. Dynamic wavelength shift from C-Band ($1550\text{ nm}$) to bend-resilient O-Band ($1310\text{ nm}$).
  2. Adaptive modulation step-down ($16\text{-QAM} \rightarrow \text{QPSK}$) + EDFA gain trim during laser thermal sag.
  3. Immediate MPLS-TE Fast-Reroute / BGP-PIC edge failover prior to physical fibre severing.

---

## 6. Two-Stage Open Release Summary

| Milestone | Target Date | Repository | Scope |
| :--- | :--- | :--- | :--- |
| **Stage 1: Open Software** | **September 2027** | [`github.com/sassil70/cablehunt`](https://github.com/sassil70/cablehunt) | Core Python 12-bit DSP suite, `.SOR` parser & Netmiko CLI drivers |
| **Stage 2: Smart AI Model** | **2029** | [`huggingface.co/sassil/cablehunt-optical-ai`](https://huggingface.co/sassil/cablehunt-optical-ai) | Pre-trained 1D-CNN + Spectral PINN weights & 12-bit `.SOR` dataset |

For technical questions or Birmingham 80 km testbed sessions: **[`info@cablehunt.co.uk`](mailto:info@cablehunt.co.uk)** | **[`saleem@cablehunt.co.uk`](mailto:saleem@cablehunt.co.uk)** | **[`jalal@cablehunt.co.uk`](mailto:jalal@cablehunt.co.uk)**.
