import Link from "next/link";
import ThemeSwitcher from "@/components/ThemeSwitcher";

export default function Home() {
  return (
    <main
      style={{ background: "var(--bg-primary)", color: "var(--text-primary)" }}
    >
      <nav
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          borderBottom: "1px solid var(--border)",
          background: "var(--bg-primary)",
          backdropFilter: "blur(20px)",
        }}
      >
        <div
          style={{
            maxWidth: "1100px",
            margin: "0 auto",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "16px 24px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontSize: "24px", color: "var(--accent)" }}>⊛</span>
            <span
              style={{
                fontWeight: 700,
                fontSize: "15px",
                color: "var(--text-primary)",
              }}
            >
              PayStream
            </span>
            <span
              style={{
                fontSize: "10px",
                padding: "3px 10px",
                borderRadius: "20px",
                marginLeft: "4px",
                fontWeight: 500,
                background: "var(--accent-light)",
                color: "var(--accent)",
                border: "1px solid var(--border)",
              }}
            >
              HeLa Network
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "28px" }}>
            <a
              href="#features"
              style={{
                fontSize: "13px",
                color: "var(--text-secondary)",
                textDecoration: "none",
              }}
            >
              Features
            </a>
            <a
              href="#how-it-works"
              style={{
                fontSize: "13px",
                color: "var(--text-secondary)",
                textDecoration: "none",
              }}
            >
              How It Works
            </a>
            <ThemeSwitcher />
          </div>
        </div>
      </nav>

      <section
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "120px 24px 80px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "-150px",
            left: "-150px",
            width: "500px",
            height: "500px",
            borderRadius: "50%",
            background: "var(--accent-glow)",
            filter: "blur(150px)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-150px",
            right: "-150px",
            width: "500px",
            height: "500px",
            borderRadius: "50%",
            background: "var(--accent-glow)",
            filter: "blur(150px)",
            pointerEvents: "none",
          }}
        />

        <div
          style={{
            textAlign: "center",
            maxWidth: "800px",
            position: "relative",
            zIndex: 1,
          }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              borderRadius: "999px",
              padding: "6px 18px",
              fontSize: "12px",
              fontWeight: 500,
              marginBottom: "40px",
              background: "var(--accent-light)",
              color: "var(--text-secondary)",
              border: "1px solid var(--border)",
            }}
          >
            <span
              style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                background: "var(--success)",
                animation: "pulse-slow 2s ease-in-out infinite",
              }}
            />
            Powered by HLUSD Stablecoin
          </div>

          <h1
            style={{
              fontFamily: "var(--font-serif), 'Playfair Display', serif",
              fontSize: "clamp(48px, 8vw, 80px)",
              fontWeight: 700,
              lineHeight: 1.05,
              marginBottom: "28px",
              color: "var(--text-primary)",
              letterSpacing: "-1px",
            }}
          >
            Salary Streaming
            <br />
            <span style={{ color: "var(--accent)" }}>Real-Time.</span>
          </h1>

          <p
            style={{
              fontSize: "17px",
              lineHeight: 1.7,
              maxWidth: "520px",
              margin: "0 auto 44px",
              color: "var(--text-secondary)",
            }}
          >
            Stream salaries to employees by the second. No more waiting for
            payday. Powered by HeLa blockchain.
          </p>

          <Link
            href="/dashboard"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              fontWeight: 600,
              padding: "14px 36px",
              borderRadius: "14px",
              fontSize: "14px",
              textDecoration: "none",
              background: "var(--gradient-accent)",
              color: "var(--text-inverse)",
              boxShadow: "var(--shadow-lg)",
              transition: "transform 0.2s, box-shadow 0.2s",
            }}
          >
            Get Started <span>→</span>
          </Link>
        </div>
      </section>

      <section
        id="features"
        style={{
          padding: "100px 24px",
          maxWidth: "1100px",
          margin: "0 auto",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "64px" }}>
          <h2
            style={{
              fontFamily: "var(--font-serif), 'Playfair Display', serif",
              fontSize: "clamp(32px, 5vw, 48px)",
              fontWeight: 700,
              marginBottom: "16px",
              color: "var(--text-primary)",
            }}
          >
            Why <span style={{ color: "var(--accent)" }}>PayStream?</span>
          </h2>
          <p
            style={{
              fontSize: "15px",
              color: "var(--text-secondary)",
              maxWidth: "460px",
              margin: "0 auto",
              lineHeight: 1.6,
            }}
          >
            The future of payroll is streaming. Here&apos;s what makes us
            different.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "20px",
          }}
        >
          {[
            {
              icon: "1",
              title: "HR Dashboard",
              desc: "Deposit funds, create salary streams, monitor employees, and manage tax vault.",
            },
            {
              icon: "2",
              title: "Automated Tax",
              desc: "Tax is automatically deducted on every withdrawal and stored securely on-chain.",
            },
            {
              icon: "3",
              title: "Live Earnings",
              desc: "Watch your salary grow every second. Withdraw whenever you want.",
            },
            {
              icon: "4",
              title: "Instant Withdrawals",
              desc: "Employees can withdraw their earned salary instantly, at any time.",
            },
            {
              icon: "5",
              title: "On-Chain Analytics",
              desc: "Full transparency with real-time on-chain data and analytics dashboards.",
            },
            {
              icon: "6",
              title: "Global Payroll",
              desc: "Pay employees anywhere in the world with borderless crypto payments.",
            },
          ].map((f, i) => (
            <div
              key={i}
              style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border)",
                borderRadius: "16px",
                padding: "28px",
                transition: "border-color 0.3s, box-shadow 0.3s",
              }}
              className="glass-card"
            >
              <div
                style={{
                  width: "44px",
                  height: "44px",
                  borderRadius: "12px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "20px",
                  marginBottom: "20px",
                  background: "var(--accent-light)",
                  border: "1px solid var(--border)",
                }}
              >
                {f.icon}
              </div>
              <h3
                style={{
                  fontWeight: 700,
                  fontSize: "16px",
                  marginBottom: "8px",
                  color: "var(--text-primary)",
                }}
              >
                {f.title}
              </h3>
              <p
                style={{
                  fontSize: "13px",
                  lineHeight: 1.6,
                  color: "var(--text-muted)",
                }}
              >
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section
        id="how-it-works"
        style={{
          padding: "100px 24px",
          maxWidth: "800px",
          margin: "0 auto",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "64px" }}>
          <h2
            style={{
              fontFamily: "var(--font-serif), 'Playfair Display', serif",
              fontSize: "clamp(32px, 5vw, 48px)",
              fontWeight: 700,
              color: "var(--text-primary)",
            }}
          >
            How It <span style={{ color: "var(--accent)" }}>Works</span>
          </h2>
        </div>

        <div style={{ position: "relative", paddingLeft: "60px" }}>
          <div
            style={{
              position: "absolute",
              left: "23px",
              top: "24px",
              bottom: "24px",
              width: "2px",
              background: "var(--border)",
            }}
          />

          {[
            {
              num: "01",
              title: "Connect Wallet",
              desc: "Link your crypto wallet to the PayStream platform.",
            },
            {
              num: "02",
              title: "Add Employees",
              desc: "Set up employee wallets and define salary streams.",
            },
            {
              num: "03",
              title: "Fund & Stream",
              desc: "Deposit stablecoins and start streaming salaries in real-time.",
            },
            {
              num: "04",
              title: "Withdraw Anytime",
              desc: "Employees can withdraw earned salary at any moment.",
            },
          ].map((step, i) => (
            <div
              key={i}
              style={{
                marginBottom: i < 3 ? "48px" : "0",
                position: "relative",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  left: "-60px",
                  top: "0",
                  width: "48px",
                  height: "48px",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "13px",
                  fontWeight: 600,
                  color: "var(--accent)",
                  border: "2px solid var(--accent)",
                  background: "var(--bg-primary)",
                  zIndex: 1,
                }}
              >
                {step.num}
              </div>
              <div style={{ paddingTop: "4px", paddingLeft: "12px" }}>
                <h3
                  style={{
                    fontWeight: 700,
                    fontSize: "17px",
                    marginBottom: "6px",
                    color: "var(--text-primary)",
                  }}
                >
                  {step.title}
                </h3>
                <p
                  style={{
                    fontSize: "14px",
                    color: "var(--text-muted)",
                    lineHeight: 1.5,
                  }}
                >
                  {step.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <footer
        style={{
          borderTop: "1px solid var(--border)",
          padding: "32px 24px",
          marginTop: "40px",
        }}
      >
        <div
          style={{
            maxWidth: "1100px",
            margin: "0 auto",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "18px", color: "var(--accent)" }}>⊛</span>
            <span
              style={{
                fontWeight: 700,
                fontSize: "14px",
                color: "var(--text-primary)",
              }}
            >
              PayStream
            </span>
          </div>
          <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>
            © 2026 PayStream. Built on HeLa blockchain.
          </p>
        </div>
      </footer>
    </main>
  );
}
