import React from "react";

import video1 from "../../assets/videos/video1.mp4";
import video2 from "../../assets/videos/video2.mp4"; // vertical
import video3 from "../../assets/videos/video3.mp4";

// activities (1..8)
import activity1Img from "../../assets/photos/activity_1.jpg";
import activity2Img from "../../assets/photos/activity_2.jpg";
import activity3Img from "../../assets/photos/activity_3.jpg";
import activity4Img from "../../assets/photos/activity_4.jpg";
import activity5Img from "../../assets/photos/activity_5.jpg";
import activity6Img from "../../assets/photos/activity_6.jpg";
import activity7Img from "../../assets/photos/activity_7.jpg";
import activity8Img from "../../assets/photos/activity_8.jpg";

export const activities = [
  { src: activity1Img, alt: "Activity 1" },
  { src: activity2Img, alt: "Activity 2" },
  { src: activity3Img, alt: "Activity 3" },
  { src: activity4Img, alt: "Activity 4" },
  { src: activity5Img, alt: "Activity 5" },
  { src: activity6Img, alt: "Activity 6" },
  { src: activity7Img, alt: "Activity 7" },
  { src: activity8Img, alt: "Activity 8" },
];

// ===================== ACTIVITIES =====================

export const ActivitiesSection = ({
  images,
}: {
  images: { src: string; alt: string }[];
}) => {
  return (
    <section
      style={{
        minHeight: "64vh",
        scrollSnapAlign: "center",
        padding: "40px 0",
        display: "flex",
        flexDirection: "column",
        gap: 20,
      }}
    >
      <div style={{ textAlign: "center" }}>
        <div
          style={{
            display: "inline-block",
            background: "linear-gradient(135deg,#ecfdf5 0%,#d1fae5 100%)",
            color: "#047857",
            padding: "6px 16px",
            borderRadius: 999,
            fontSize: 13,
            fontWeight: 800,
            border: "1px solid #a7f3d0",
            letterSpacing: ".4px",
          }}
        >
          الفعاليات
        </div>
      </div>

      <div
        className="acts-row"
        style={{
          width: "100%",
          maxWidth: 1160,
          margin: "0 auto",
          display: "grid",
          gridAutoFlow: "column",
          gridAutoColumns: "min(90%, 560px)", // big wide cards
          gap: 18,
          overflowX: "auto",
          scrollSnapType: "x mandatory",
          padding: "12px 10px",
          scrollbarWidth: "none" as any,
          msOverflowStyle: "none",
          WebkitMaskImage:
            "linear-gradient(90deg, transparent 0, #000 6%, #000 94%, transparent 100%)",
          maskImage:
            "linear-gradient(90deg, transparent 0, #000 6%, #000 94%, transparent 100%)",
        }}
      >
        <style>{`
          .acts-row::-webkit-scrollbar{ display:none; }
          .act-card{ scroll-snap-align:center; }
          .act-card:hover { transform: translateY(-6px); box-shadow:0 26px 80px rgba(15,23,42,.18); }

          @media (min-width: 900px) {
            .acts-row { grid-auto-columns: min(60%, 620px); } /* still large on desktop */
          }
        `}</style>

        {images.map((img, i) => (
          <div
            key={i}
            className="act-card"
            style={{
              background: "#fff",
              border: "1px solid rgba(2,6,23,.06)",
              borderRadius: 24,
              overflow: "hidden",
              boxShadow: "0 22px 70px rgba(2,6,23,.14)",
              position: "relative",
              minHeight: 260,
              transition: "transform .25s ease, box-shadow .25s ease",
            }}
          >
            <img
              src={img.src}
              alt={img.alt}
              loading="lazy"
              style={{
                width: "100%",
                height: "100%",
                display: "block",
                objectFit: "cover",
                aspectRatio: "16 / 10",
              }}
            />
          </div>
        ))}
      </div>
    </section>
  );
};

// ===================== VIDEOS =====================

export const VideosSection = () => {
  const landscapeVideos = [video1, video3]; // 16:9
  const portraitVideo = video2; // 9:16

  return (
    <section
      style={{
        minHeight: "60vh",
        scrollSnapAlign: "center",
        padding: "40px 0",
        display: "flex",
        alignItems: "center",
      }}
    >
      <div style={{ width: "100%", maxWidth: 1160, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 18 }}>
          <div
            style={{
              display: "inline-block",
              background: "linear-gradient(135deg,#ecfeff 0%,#cffafe 100%)",
              color: "#0369a1",
              padding: "6px 16px",
              borderRadius: 999,
              fontSize: 13,
              fontWeight: 800,
              border: "1px solid #bae6fd",
              letterSpacing: ".4px",
            }}
          >
            فيديوهات
          </div>
          <h3
            style={{
              fontSize: 32,
              fontWeight: 900,
              marginTop: 12,
              color: "#0f172a",
            }}
          >
            مشاهد قصيرة توضح رسالتنا
          </h3>
        </div>

        {/* Main layout: portrait on one side, landscape stack on the other */}
        <div
          className="videos-layout"
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(240px, 0.8fr) minmax(320px, 1.2fr)",
            gap: 24,
            alignItems: "stretch",
          }}
        >
          <style>{`
            @media (max-width: 900px) {
              .videos-layout {
                grid-template-columns: 1fr;
              }
            }

            .video-card-common {
              background: #fff;
              border: 1px solid rgba(2,6,23,.06);
              border-radius: 24px;
              overflow: hidden;
              box-shadow: 0 24px 72px rgba(2,6,23,.16);
              position: relative;
              cursor: pointer;
              transition: transform .2s ease, box-shadow .2s ease;
            }

            .video-card-common:hover {
              transform: translateY(-4px);
              box-shadow: 0 28px 80px rgba(15,23,42,.2);
            }
          `}</style>

          {/* Left: vertical video */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
            }}
          >
            <div
              className="video-card-common"
              style={{
                width: "100%",
                maxWidth: 420,
              }}
            >
              <div
                style={{
                  width: "100%",
                  aspectRatio: "9 / 16",
                  background: "#020617",
                }}
              >
                <video
                  src={portraitVideo}
                  playsInline
                  controls={false}
                  preload="metadata"
                  style={{
                    width: "100%",
                    height: "100%",
                    display: "block",
                    objectFit: "cover", // fill tall box, no padding
                  }}
                  onClick={(e) => {
                    const v = e.currentTarget;
                    document
                      .querySelectorAll("video")
                      .forEach((x) => x !== v && x.pause());
                    v.paused ? v.play() : v.pause();
                  }}
                  onDoubleClick={(e) => {
                    const v = e.currentTarget as HTMLVideoElement;
                    if (!document.fullscreenElement) {
                      v.requestFullscreen?.();
                    } else {
                      document.exitFullscreen?.();
                    }
                  }}
                />
              </div>
            </div>
          </div>

          {/* Right: two stacked horizontal videos */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 16,
            }}
          >
            {landscapeVideos.map((src, i) => (
              <div key={i} className="video-card-common">
                <div
                  style={{
                    width: "100%",
                    aspectRatio: "16 / 9",
                    background: "#020617",
                  }}
                >
                  <video
                    src={src}
                    playsInline
                    controls={false}
                    preload="metadata"
                    style={{
                      width: "100%",
                      height: "100%",
                      display: "block",
                      objectFit: "cover",
                    }}
                    onClick={(e) => {
                      const v = e.currentTarget;
                      document
                        .querySelectorAll("video")
                        .forEach((x) => x !== v && x.pause());
                      v.paused ? v.play() : v.pause();
                    }}
                    onDoubleClick={(e) => {
                      const v = e.currentTarget as HTMLVideoElement;
                      if (!document.fullscreenElement) {
                        v.requestFullscreen?.();
                      } else {
                        document.exitFullscreen?.();
                      }
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
