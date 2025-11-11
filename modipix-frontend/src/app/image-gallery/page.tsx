"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { SignedIn, SignedOut, RedirectToSignIn } from "@clerk/nextjs";

const ImageGallery = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [verdictFilter, setVerdictFilter] = useState("All Verdicts");
  const [riskScoreFilter, setRiskScoreFilter] = useState("Any Risk Score");
  const [dateFilter, setDateFilter] = useState("");
  const router = useRouter();

  const imageData = [
    {
      id: 1,
      title: "Abstract Art 01",
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuDNsQqfS169i-lvsnIINeLNfreQErXc1QKK9XTUJFmyX-zAH5u5ydBYogPhS9Igiwj9KuXGgvOkCnbqpeunDyR6fFly9VXuWaH2ZbvMcgPdlaspVXW0l_rNv0bhhWyXmovHvtszRoBXTt1YXTxJ12PPe6--C0-nKlYC5Y3o15M_N-sGVI5fttGADhfCRvnV8cjM-8u2EcqT3tiscb0zwW79pM04-dRXatFE0V2o2Ppq2jLdhMI-vsTR5Piyp-nRRETYTMuJpaAjKJg",
      verdict: "Unsafe",
      verdictColor: "bg-red-100/20 text-red-300 ring-red-400/30",
      icon: "error",
      riskScore: "92%",
    },
    {
      id: 2,
      title: "Landscape Photo",
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuBaJ9vdiD0c3lohUlpJ5oD55XZ-AJp7AQKGmemXSgHKrX_CWvTyNouxm-mzcE265u-KlWevCekiiq5xyR8WDKyvRJkwFK1cklPwKMqtZ9bh3Xqy3ZuyxfNtNKjeUEhAU7ZaEih2AHCNuvwQAu69w_sIKNpU5XfX7UOOJ5eSYfFaFrfFIczubnFest9SnqQvJisj3N1a-vTzo7F7a49RLD0pV0DK4Pq2cb5Bax21QIY8XL3k-AdG3C34M4fqsUtYwmQYERsP4EXghvw",
      verdict: "Safe",
      verdictColor: "bg-green-100/20 text-green-300 ring-green-400/30",
      icon: "check_circle",
      riskScore: "15%",
    },
    {
      id: 3,
      title: "Cityscape Night",
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuBrAOCT-TnQN71orR8iBMADQtt9dgtfDWMyvKxORnqpyXlk0h7-SwYxcvQQqgpTJJaxEbSXH8stOMy9-WkvcFryv7VUnM4E2H8FoMPHHH5eKFrLnUlsNKlbf2qBjUhw4WsxI_hSUvoVh6W9A-TlAj1SFtm8S4TCssRvlreIm04pGgkRxNZuQU8jTh6iCuKEpWVRr8XUOyrJGjItx-b0SXHKoamDRzOyfaU3M9FEREif7r57oVLgCVjHJtmOK5rrdpUn1x6c-sYkWto",
      verdict: "Safe",
      verdictColor: "bg-green-100/20 text-green-300 ring-green-400/30",
      icon: "check_circle",
      riskScore: "5%",
    },
    {
      id: 4,
      title: "Portrait Study",
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuBluP4gDlUgyEJEnpc_A4uArH_c4J2OQLrXMT1YGbZo7mHbi3cPARy1nSWKkWZqaZ3yMM4Qh1O5CogagU_dgCPHuspjDb4CZDIcENcsUICCcE3ty_QUmJbXPRych36HGC0_uQzG_STagLNOzi-vudOhxbbl74NRMhqqaqT-CTxk4T8s_g-f5jLjynQLSAzxiSQNTSE9H1lQP6S2YS8o6PEB7sb5gcJYKYKFmqCQPkx2U91aShv0gbCmCUt3Aje7s41efnV8I1JRPo8",
      verdict: "Risky",
      verdictColor: "bg-yellow-100/20 text-yellow-300 ring-yellow-400/30",
      icon: "warning",
      riskScore: "45%",
    },
    {
      id: 5,
      title: "User Avatar 23",
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuAqO13revIWP_49ZKdH3I1aOOQjYg7agWtzeckndOxqJzonKF830BJw-WzOXwON-DQoJCfI0nql-EpaXZCdsELaIQ47KuJdKlRUcKY3Lp5EMfC28_MxAIlKInI2P3oEfrkz2QtvwEqDp2_BLhp4a94jBpS_RL9bUtCxUnXAQE-akq5dpImS_n7-yDTmCzv_4jqw3nqFBvqkjbbXDdCSL9Mt3EAHGvo5KHQkLNPAI-LatsKarjeKZUSDtuhGgOWPBq3mnQBFKOnRY98",
      verdict: "Safe",
      verdictColor: "bg-green-100/20 text-green-300 ring-green-400/30",
      icon: "check_circle",
      riskScore: "2%",
    },
    {
      id: 6,
      title: "Product Shot",
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuAAL7e2sDffi4prpRdM7jCoCngmnVgKKhk3p71dOGE7rD76idFx6Jyh8L_8ILe-NYMNFXgNopZW6YfBSCcWKXvkca5Of8IEDP8YKJlAt4kRkB2Lt8SNdGU3W1GOd4tgnjPv8k1wWeFhLyGwLOameVxGZTg-FPNEBw8sPuS7Q5tzCkluIuD7798Bia5B9Q95Z2XOQj-jH3QfRZLWLmVM925QjI9Wz1gpOhzN_Zz5VaWzhDXgXbLmxkDDra5NAUGC5RkwFOOMPlqm03E",
      verdict: "Safe",
      verdictColor: "bg-green-100/20 text-green-300 ring-green-400/30",
      icon: "check_circle",
      riskScore: "8%",
    },
    {
      id: 7,
      title: "Graphic Design",
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuAMDKRzhgraE2uhGQdYvf398S_vCFMxXg8KVr3i8orgosBNG4gWlpm_dQUGBrZZ1_oDXP11Hxw4muOR0Ju7OPt2VFo3iKMQGwxbTP2Vhil-BmtTCiYfudm_pi2y0QQ9VfHa1XK-LWWjAQTojCRsrYANXCd4x3ExMOcYCL70UO_X_LtvFaKJTPzfL8SVfgVowhk8HgRIFE2vSLLQiYbaAlxK4173YjUh6VEf1-JGZLWH7-WFWF3CNmehYGfBaAYsH7EDRSjvJP7fp20",
      verdict: "Unsafe",
      verdictColor: "bg-red-100/20 text-red-300 ring-red-400/30",
      icon: "error",
      riskScore: "88%",
    },
    {
      id: 8,
      title: "Nature Closeup",
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuD1osUUv7SDs2IREAWeMxIkyGBOL2wfGgO8ciADLGqxZGM0ciUUlZnprlGHKNKtyWzoKcYaTaQxB48JEbwyJkC7RQSFSOZggagITkYSIzV1gJVJtRd3KgndUrd1IcpRSl4T7b-kqs5P3qA2D2ZT1XyAiZLgLJWsDY-BtnJ3hDu6sJTNBldsruCym1Gt17G4tQ9-u5BcfWtuvaKIzXizqYZpqBpaUDsZr_M-J0qkvmpNHSharBe-m9IUqkH7pM0adIIwAA9-XhDCfXI",
      verdict: "Safe",
      verdictColor: "bg-green-100/20 text-green-300 ring-green-400/30",
      icon: "check_circle",
      riskScore: "12%",
    },
    {
      id: 9,
      title: "Meme Image",
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuBEO04GGFmYv6xhlut3n8Z3pOB_G6xNRlKPmvmyX8H53-YDr5slaO4jT5Qc1kovhs-ZFPXKn4Y4Lw_F7uvC2WKMNwZSJ_FYf4UgocB1fWMTetfd7nBIGahUjyYW5SfTCcT4w3qBomX-CaJ9fSKIibUFqiG3D3A8Z-mVqUpLPjwywvsQcgCaKNtwb6zsspMeL66TchUUm-tbJRRC0Dn7IZzVqEy2dTJxmBKg4PUsBxOyvCknNM_IlD9r2nGJyalt-1wxUy9UAsP-Hlk",
      verdict: "Risky",
      verdictColor: "bg-yellow-100/20 text-yellow-300 ring-yellow-400/30",
      icon: "warning",
      riskScore: "55%",
    },
    {
      id: 10,
      title: "Architectural Detail",
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuCJkJgyX7RzmFGZWR8BgjQBOeVbhluYXANzB9cmUnYgSeTSm5WVyLpRXM-csFG8kDpgl7wIJODtM9gDuA5sqQaM_jedGio3_Vh8vU_WsBSfT4pcMkCNFqcGHNSRg_n8osXJKymDhJXdLaKnpGAejLIcId5v9h6rBLl0DbNCEzMymcpoWVgYVF5646Ah9xIXFBZQhxP-FWaxJmerrDXpP0FKqMapFRJjrwq3fcMk7epYJBHNqe_BzSIXMykKwEgbx7enah649Ib-76M",
      verdict: "Safe",
      verdictColor: "bg-green-100/20 text-green-300 ring-green-400/30",
      icon: "check_circle",
      riskScore: "3%",
    },
  ];

  // Filter images based on search and filters
  const filteredImages = imageData.filter((image) => {
    const matchesSearch = image.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesVerdict =
      verdictFilter === "All Verdicts" || image.verdict === verdictFilter;

    let matchesRiskScore = true;
    if (riskScoreFilter !== "Any Risk Score") {
      const riskValue = parseInt(image.riskScore.replace("%", ""));
      switch (riskScoreFilter) {
        case "High (75% - 100%)":
          matchesRiskScore = riskValue >= 75;
          break;
        case "Medium (40% - 74%)":
          matchesRiskScore = riskValue >= 40 && riskValue < 75;
          break;
        case "Low (0% - 39%)":
          matchesRiskScore = riskValue < 40;
          break;
      }
    }

    return matchesSearch && matchesVerdict && matchesRiskScore;
  });

  return (
    <>
      <style jsx>{`
        :root {
          --primary-color: #1773cf;
        }
      `}</style>

      <SignedIn>
        <div
          className="w-full min-h-screen bg-background"
          style={{ fontFamily: 'Inter, "Noto Sans", sans-serif' }}
        >
          <main className="w-full bg-muted/30 p-4 sm:p-6 lg:p-8">
            <div className="mx-auto max-w-screen-xl">
              {/* Header Section */}
              <div className="mb-6 sm:mb-8">
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                  Image Gallery
                </h2>
                <p className="mt-2 text-sm sm:text-base text-muted-foreground">
                  Browse and filter past moderation activities.
                </p>
              </div>

              {/* Filter Controls */}
              <div className="mb-6 rounded-lg border border-border bg-card p-4 shadow-sm">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {/* Search Input */}
                  <div className="relative">
                    <label className="sr-only" htmlFor="search-images">
                      Search Images
                    </label>
                    <input
                      className="w-full rounded-md border border-input bg-background text-foreground py-2.5 pl-10 pr-4 text-sm focus:border-ring focus:ring-ring placeholder:text-muted-foreground"
                      id="search-images"
                      placeholder="Search by image name..."
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>

                  {/* Verdict Filter */}
                  <div>
                    <label className="sr-only" htmlFor="filter-verdict">
                      Filter by Verdict
                    </label>
                    <select
                      className="w-full rounded-md border border-input bg-background text-foreground py-2.5 pl-3 pr-10 text-sm focus:border-ring focus:ring-ring"
                      id="filter-verdict"
                      value={verdictFilter}
                      onChange={(e) => setVerdictFilter(e.target.value)}
                    >
                      <option>All Verdicts</option>
                      <option>Safe</option>
                      <option>Risky</option>
                      <option>Unsafe</option>
                    </select>
                  </div>

                  {/* Risk Score Filter */}
                  <div>
                    <label className="sr-only" htmlFor="filter-risk-score">
                      Filter by Risk Score
                    </label>
                    <select
                      className="w-full rounded-md border border-input bg-background text-foreground py-2.5 pl-3 pr-10 text-sm focus:border-ring focus:ring-ring"
                      id="filter-risk-score"
                      value={riskScoreFilter}
                      onChange={(e) => setRiskScoreFilter(e.target.value)}
                    >
                      <option>Any Risk Score</option>
                      <option>High (75% - 100%)</option>
                      <option>Medium (40% - 74%)</option>
                      <option>Low (0% - 39%)</option>
                    </select>
                  </div>

                  {/* Date Filter */}
                  <div>
                    <label className="sr-only" htmlFor="filter-date">
                      Filter by Upload Date
                    </label>
                    <input
                      className="w-full rounded-md border border-input bg-background text-foreground py-2.5 px-3 text-sm focus:border-ring focus:ring-ring"
                      id="filter-date"
                      type="date"
                      value={dateFilter}
                      onChange={(e) => setDateFilter(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Image Grid */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                {filteredImages.length > 0 ? (
                  filteredImages.map((image) => (
                    <div
                      key={image.id}
                      className="group relative cursor-pointer overflow-hidden rounded-lg shadow-sm transition-shadow hover:shadow-lg"
                      onClick={() => {
                        const params = new URLSearchParams({
                          id: String(image.id),
                          title: image.title,
                          image: image.image,
                          verdict: image.verdict,
                          riskScore: image.riskScore,
                          source: "image-gallery",
                        });
                        router.push(`/test?${params.toString()}`);
                      }}
                    >
                      <img
                        alt={image.title}
                        className="h-48 sm:h-64 w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        src={image.image}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute bottom-0 left-0 p-3 sm:p-4 text-white">
                        <h3 className="text-sm font-semibold truncate">
                          {image.title}
                        </h3>
                        <div className="mt-1 flex items-center gap-2 text-xs">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 ring-1 ring-inset ${image.verdictColor}`}
                          >
                            <span className="material-symbols-outlined text-xs">
                              {image.icon}
                            </span>
                            <span className="hidden sm:inline">
                              {image.verdict}
                            </span>
                          </span>
                          <span className="font-medium">{image.riskScore}</span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full text-center py-12">
                    <div className="text-muted-foreground mb-4">
                      <span className="material-symbols-outlined text-6xl">
                        search_off
                      </span>
                    </div>
                    <h3 className="text-lg font-medium text-foreground mb-2">
                      No images found
                    </h3>
                    <p className="text-muted-foreground">
                      Try adjusting your search terms or filters.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </main>
        </div>
      </SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  );
};

export default ImageGallery;
