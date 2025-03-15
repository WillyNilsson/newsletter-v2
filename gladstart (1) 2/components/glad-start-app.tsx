"use client"

import { useState, useEffect, useRef, useCallback, useMemo } from "react"
import { Filter, Search, Users, Facebook, Twitter, Instagram, Linkedin } from "lucide-react"
import ArticleCard from "./article-card"
import GladstartLogo from "./gladstart-logo"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

// Swedish landscapes for our regional explorer
const landscapes = [
  { id: 1, name: "Uppland", positivity: 0.91, articles: 98 },
  { id: 3, name: "Skåne", positivity: 0.79, articles: 156 },
  { id: 6, name: "Småland", positivity: 0.81, articles: 68 },
  { id: 7, name: "Halland", positivity: 0.84, articles: 65 },
  { id: 8, name: "Närke", positivity: 0.77, articles: 62 },
  { id: 9, name: "Dalarna", positivity: 0.75, articles: 58 },
  { id: 12, name: "Blekinge", positivity: 0.8, articles: 45 },
]

interface Article {
  id: number
  title: string
  summary: string
  source: { id: number; name: string }
  published_date: string
  positivity_score: number
  topics: { id: number; name: string }[]
  region: string
  image_url: string
  url: string
}

interface ArticlesData {
  articles: Article[]
}

export default function GladStartApp() {
  const [showFilterDropdown, setShowFilterDropdown] = useState(false)
  const [showSearchDropdown, setShowSearchDropdown] = useState(false)
  const [activeTab, setActiveTab] = useState("feed")
  const [articles, setArticles] = useState<Article[]>([])
  const [displayedArticles, setDisplayedArticles] = useState<Article[]>([])
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [filters, setFilters] = useState({
    region: "all",
    topics: [] as string[],
    sources: [] as string[],
    minScore: 0.7,
  })
  const [showFilters, setShowFilters] = useState(false)
  const [selectedRegion, setSelectedRegion] = useState<any>(null)
  const loaderRef = useRef<HTMLDivElement>(null)
  const ARTICLES_PER_PAGE = 5
  const [isInitialized, setIsInitialized] = useState(false)

  // Fetch articles from API or fallback to JSON file
  useEffect(() => {
    const fetchArticles = async () => {
      try {
        let articlesData: Article[] = []
        let fetchSuccessful = false

        // First try to fetch from the API
        try {
          const apiResponse = await fetch("https://gladstart.com/api/newsarticles", {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          })

          // If API call is successful, use that data
          if (apiResponse.ok) {
            const apiData: ArticlesData = await apiResponse.json()
            articlesData = apiData.articles
            fetchSuccessful = true
            console.log("Successfully fetched articles from API")
          }
        } catch (apiError) {
          console.error("API fetch failed:", apiError)
        }

        // If API call fails, fallback to local JSON file
        if (!fetchSuccessful) {
          try {
            const localResponse = await fetch("/mock-articles.json")
            if (localResponse.ok) {
              const localData: ArticlesData = await localResponse.json()
              articlesData = localData.articles
              fetchSuccessful = true
              console.log("Successfully fetched articles from mock JSON")
            }
          } catch (localError) {
            console.error("Local JSON fetch failed:", localError)
          }
        }

        // If both API and local JSON fail, use hardcoded fallback data
        if (!fetchSuccessful || articlesData.length === 0) {
          console.log("Using hardcoded fallback data")
          articlesData = [
            {
              id: 1,
              title: "Genombrott i svensk forskning kring förnybar energi",
              summary:
                "Forskare vid Uppsala universitet har utvecklat en ny metod för att lagra solenergi med 40% högre effektivitet än tidigare teknik.",
              source: { id: 3, name: "SVT Nyheter" },
              published_date: "2025-03-11T16:24:00Z",
              positivity_score: 0.92,
              topics: [
                { id: 1, name: "Miljö" },
                { id: 2, name: "Forskning" },
              ],
              region: "Uppsala",
              image_url: "/placeholder.svg?height=400&width=600",
              url: "https://www.svt.se/nyheter/artikel/12345",
            },
            {
              id: 2,
              title: "Nya vårdmetoden minskar väntetiden för patienter med 70 procent",
              summary:
                "En innovativ arbetsmodell vid Sahlgrenska Universitetssjukhuset har kraftigt reducerat väntetiden för patienter.",
              source: { id: 5, name: "Göteborgs-Posten" },
              published_date: "2025-03-12T09:15:00Z",
              positivity_score: 0.87,
              topics: [
                { id: 4, name: "Hälsa" },
                { id: 3, name: "Innovation" },
              ],
              region: "Västra Götaland",
              image_url: "/placeholder.svg?height=400&width=600",
              url: "https://www.gp.se/nyheter/artikel/67890",
            },
            {
              id: 3,
              title: 'Svensk startup säkrar miljardinvestering: "Kommer förändra hållbart mode"',
              summary: "Stockholmsbaserade Re:Textile har utvecklat en teknik för 100% återvinning av textilier.",
              source: { id: 11, name: "Breakit" },
              published_date: "2025-03-12T07:30:00Z",
              positivity_score: 0.89,
              topics: [
                { id: 1, name: "Miljö" },
                { id: 5, name: "Ekonomi" },
                { id: 6, name: "Mode" },
              ],
              region: "Stockholm",
              image_url: "/placeholder.svg?height=400&width=600",
              url: "https://www.breakit.se/artikel/24680",
            },
            {
              id: 4,
              title: "Småländsk kommun först i landet med 100% fossilfri kollektivtrafik",
              summary: "Växjö kommun har nått sitt mål om helt fossilfri kollektivtrafik fem år före tidsplanen.",
              source: { id: 3, name: "SVT Nyheter" },
              published_date: "2025-03-11T14:12:00Z",
              positivity_score: 0.85,
              topics: [
                { id: 1, name: "Miljö" },
                { id: 7, name: "Transport" },
              ],
              region: "Kronoberg",
              image_url: "/placeholder.svg?height=400&width=600",
              url: "https://www.svt.se/nyheter/artikel/13579",
            },
            {
              id: 5,
              title: "Svenska elevresultat visar stark uppgång i internationella mätningar",
              summary:
                "De senaste PISA-resultaten visar att svenska elever presterar allt bättre i matematik och naturvetenskap.",
              source: { id: 2, name: "Dagens Nyheter" },
              published_date: "2025-03-10T18:45:00Z",
              positivity_score: 0.83,
              topics: [{ id: 8, name: "Utbildning" }],
              region: "National",
              image_url: "/placeholder.svg?height=400&width=600",
              url: "https://www.dn.se/artikel/24680",
            },
            {
              id: 6,
              title: "Arbetslösheten i Sverige sjunker till lägsta nivån på 15 år",
              summary:
                "Nya siffror från Arbetsförmedlingen visar att arbetslösheten i Sverige nu är nere på 4,2 procent.",
              source: { id: 1, name: "Svenska Dagbladet" },
              published_date: "2025-03-12T10:30:00Z",
              positivity_score: 0.81,
              topics: [
                { id: 5, name: "Ekonomi" },
                { id: 9, name: "Arbetsmarknad" },
              ],
              region: "National",
              image_url: "/placeholder.svg?height=400&width=600",
              url: "https://www.svd.se/artikel/97531",
            },
          ]
        }

        setArticles(articlesData)
      } catch (error) {
        console.error("Error in fetchArticles:", error)
        // Ensure we always have some data even if everything fails
        setArticles([
          {
            id: 1,
            title: "Genombrott i svensk forskning kring förnybar energi",
            summary:
              "Forskare vid Uppsala universitet har utvecklat en ny metod för att lagra solenergi med 40% högre effektivitet än tidigare teknik.",
            source: { id: 3, name: "SVT Nyheter" },
            published_date: "2025-03-11T16:24:00Z",
            positivity_score: 0.92,
            topics: [
              { id: 1, name: "Miljö" },
              { id: 2, name: "Forskning" },
            ],
            region: "Uppsala",
            image_url: "/placeholder.svg?height=400&width=600",
            url: "https://www.svt.se/nyheter/artikel/12345",
          },
          {
            id: 2,
            title: "Nya vårdmetoden minskar väntetiden för patienter med 70 procent",
            summary:
              "En innovativ arbetsmodell vid Sahlgrenska Universitetssjukhuset har kraftigt reducerat väntetiden för patienter.",
            source: { id: 5, name: "Göteborgs-Posten" },
            published_date: "2025-03-12T09:15:00Z",
            positivity_score: 0.87,
            topics: [
              { id: 4, name: "Hälsa" },
              { id: 3, name: "Innovation" },
            ],
            region: "Västra Götaland",
            image_url: "/placeholder.svg?height=400&width=600",
            url: "https://www.gp.se/nyheter/artikel/67890",
          },
        ])
      }
    }

    fetchArticles()
  }, [])

  // Memoize filtered articles to prevent recalculation on every render
  const filteredArticles = useMemo(() => {
    return articles.filter((article) => {
      // Filter by region
      if (filters.region !== "all" && article.region !== filters.region) {
        return false
      }

      // Filter by sources
      if (filters.sources.length > 0 && !filters.sources.includes(article.source.name)) {
        return false
      }

      // Filter by topics
      if (filters.topics.length > 0 && !article.topics.some((topic) => filters.topics.includes(topic.name))) {
        return false
      }

      // Filter by positivity score
      if (article.positivity_score < filters.minScore) {
        return false
      }

      return true
    })
  }, [articles, filters])

  // Load more articles when scrolling
  const loadMoreArticles = useCallback(() => {
    if (loading) return

    setLoading(true)

    setTimeout(() => {
      const nextPage = page + 1
      const startIndex = (nextPage - 1) * ARTICLES_PER_PAGE
      const endIndex = nextPage * ARTICLES_PER_PAGE

      if (endIndex >= filteredArticles.length) {
        setHasMore(false)
      }

      setDisplayedArticles((prev) => [...prev, ...filteredArticles.slice(startIndex, endIndex)])
      setPage(nextPage)
      setLoading(false)
    }, 500)
  }, [filteredArticles, loading, page, ARTICLES_PER_PAGE])

  // Initialize displayed articles when filtered articles change
  useEffect(() => {
    if (articles.length > 0 && !isInitialized) {
      setDisplayedArticles(filteredArticles.slice(0, ARTICLES_PER_PAGE))
      setPage(1)
      setHasMore(filteredArticles.length > ARTICLES_PER_PAGE)
      setIsInitialized(true)
    }
  }, [filteredArticles, articles, isInitialized])

  // Reset pagination when filters change
  useEffect(() => {
    if (isInitialized) {
      setDisplayedArticles(filteredArticles.slice(0, ARTICLES_PER_PAGE))
      setPage(1)
      setHasMore(filteredArticles.length > ARTICLES_PER_PAGE)
    }
  }, [filters, filteredArticles, isInitialized])

  // Intersection Observer for infinite scroll
  useEffect(() => {
    if (!loaderRef.current || !hasMore) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          loadMoreArticles()
        }
      },
      { threshold: 0.1 },
    )

    observer.observe(loaderRef.current)

    return () => {
      observer.disconnect()
    }
  }, [hasMore, loading, loadMoreArticles])

  const handleFilterChange = (filterType: string, value: string) => {
    setFilters((prev) => {
      // Handle array-based filters
      if (filterType === "topics" || filterType === "sources") {
        const currentValues = [...prev[filterType as "topics" | "sources"]]
        const index = currentValues.indexOf(value)

        // If value exists, remove it, otherwise add it
        if (index !== -1) {
          currentValues.splice(index, 1)
        } else {
          currentValues.push(value)
        }

        return { ...prev, [filterType]: currentValues }
      }

      // Handle simple value filters
      return { ...prev, [filterType]: value }
    })
  }

  const resetFilters = () => {
    setFilters({
      region: "all",
      topics: [],
      sources: [],
      minScore: 0.7,
    })
  }

  const allTopics = useMemo(() => {
    return Array.from(new Set(articles.flatMap((article) => article.topics.map((topic) => topic.name))))
  }, [articles])

  const getScoreColor = (score: number) => {
    if (score >= 0.9) return "bg-orange-600 text-white"
    if (score >= 0.8) return "bg-orange-500 text-white"
    if (score >= 0.7) return "bg-orange-400 text-black"
    if (score >= 0.6) return "bg-orange-300 text-black"
    return "bg-orange-200 text-black"
  }

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("sv-SE", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date)
  }

  // Update all title headings to use the brown color
  const headerSection = (
    <header className="bg-[#f5efe7] shadow sticky top-0 z-10">
      <div className="max-w-[1000px] mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <button onClick={() => setActiveTab("feed")} className="focus:outline-none">
            <GladstartLogo />
          </button>

          <div className="flex items-center space-x-4">
            <Popover>
              <PopoverTrigger asChild>
                <button className="p-2 rounded-full hover:bg-[#ebe3d5]">
                  <Filter size={20} className="text-[#4a3520]" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-64 bg-[#f5efe7] p-4">
                <div className="flex items-center justify-between mb-4">
                  <span className="font-medium text-[#4a3520]">Filter</span>
                  <div className="bg-[#f8f3ea] text-[#e67e22] px-3 py-1 rounded-full text-sm">Kommer snart</div>
                </div>
                <div className="h-32 flex items-center justify-center text-[#6f4e37]">
                  Filterfunktionen kommer snart
                </div>
              </PopoverContent>
            </Popover>

            <Popover>
              <PopoverTrigger asChild>
                <button className="p-2 rounded-full hover:bg-[#ebe3d5]">
                  <Search size={20} className="text-[#4a3520]" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-80 bg-[#f5efe7] p-4">
                <div className="flex items-center justify-between mb-4">
                  <span className="font-medium text-[#4a3520]">Sök</span>
                  <div className="bg-[#f8f3ea] text-[#e67e22] px-3 py-1 rounded-full text-sm">Kommer snart</div>
                </div>
                <input
                  type="text"
                  placeholder="Sök efter nyheter..."
                  className="w-full p-2 border border-[#f39c12] rounded-md mb-4 bg-white"
                  disabled
                />
                <div className="h-32 flex items-center justify-center text-[#6f4e37]">Sökfunktionen kommer snart</div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>
    </header>
  )

  const sidebarSection = (
    <div className="md:w-1/4">
      <div className="bg-white p-4 rounded-lg shadow mt-6">
        <h3 className="font-medium text-2xl text-[#4a3520] mb-6">Sveriges Landskap</h3>
        <div className="space-y-4">
          {landscapes.slice(0, 6).map((region) => (
            <button
              key={region.id}
              className={`w-full p-2 text-left rounded-md transition ${
                selectedRegion?.id === region.id ? "bg-orange-100 border-l-4 border-orange-600" : "hover:bg-gray-100"
              }`}
              onClick={() => {
                setSelectedRegion(region)
                handleFilterChange("region", region.name)
              }}
            >
              <div className="flex justify-between items-center">
                <span className="text-lg text-[#4a3520]">{region.name}</span>
                <span className={`px-3 py-1 rounded-full text-sm ${getScoreColor(region.positivity)}`}>
                  +{Math.round(region.positivity * 100)}%
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )

  const footerSection = (
    <footer className="bg-[#f5efe7] py-6">
      <div className="max-w-[1000px] mx-auto px-4">
        <div className="flex flex-col gap-8">
          <div className="w-full">
            <iframe
              src="https://gladstart.curated.co/embed?color1=f5efe7&color2=4a3520&color_bg_button=e67e22&color_border=f39c12&color_button=ffffff&color_links=6f4e37&color_terms=967259&title=Join+GladStart+%F0%9F%98%8A+"
              width="100%"
              height="310"
              frameBorder="0"
              style={{ maxWidth: "100%" }}
              title="GladStart Newsletter"
            ></iframe>
          </div>
          <div className="flex justify-center space-x-6 pb-4">
            <a
              href="https://www.facebook.com/profile.php?id=61574156665429"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#6f4e37] hover:text-[#e67e22] transition-colors"
            >
              <Facebook className="h-6 w-6" />
              <span className="sr-only">Facebook</span>
            </a>
            <a
              href="https://x.com/TheGladStart"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#6f4e37] hover:text-[#e67e22] transition-colors"
            >
              <Twitter className="h-6 w-6" />
              <span className="sr-only">Twitter</span>
            </a>
            <a
              href="https://www.instagram.com/thegladstart/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#6f4e37] hover:text-[#e67e22] transition-colors"
            >
              <Instagram className="h-6 w-6" />
              <span className="sr-only">Instagram</span>
            </a>
            <a
              href="https://www.linkedin.com/company/106882021/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#6f4e37] hover:text-[#e67e22] transition-colors"
            >
              <Linkedin className="h-6 w-6" />
              <span className="sr-only">LinkedIn</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  )

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      {headerSection}

      {/* Navigation Tabs */}
      <div className="bg-[#f5efe7] border-b sticky top-[73px] z-10">
        <div className="max-w-[1000px] mx-auto px-4">
          <nav className="flex overflow-x-auto">
            <button
              className={`py-4 px-6 font-medium whitespace-nowrap ${activeTab === "feed" ? "text-[#4a3520] border-b-2 border-[#e67e22]" : "text-gray-500 hover:text-[#4a3520]"}`}
              onClick={() => setActiveTab("feed")}
            >
              Nyhetsfeed
            </button>
            <button
              className={`py-4 px-6 font-medium whitespace-nowrap ${activeTab === "regional" ? "text-[#4a3520] border-b-2 border-[#e67e22]" : "text-gray-500 hover:text-[#4a3520]"}`}
              onClick={() => setActiveTab("regional")}
            >
              Regionalt
            </button>
            <button
              className={`py-4 px-6 font-medium whitespace-nowrap ${activeTab === "userfeed" ? "text-[#4a3520] border-b-2 border-[#e67e22]" : "text-gray-500 hover:text-[#4a3520]"}`}
              onClick={() => setActiveTab("userfeed")}
            >
              Användare
            </button>
          </nav>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-white border-b shadow-sm">
          <div className="max-w-[1000px] mx-auto px-4 py-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-medium text-lg text-[#4a3520]">Filtrera nyheter</h3>
              <button className="text-gray-500 hover:text-gray-700" onClick={() => setShowFilters(false)}>
                <span className="sr-only">Stäng</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>

            <div className="space-y-6">
              {/* Region Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Region</label>
                <select
                  className="w-full p-2 border border-gray-300 rounded-md"
                  value={filters.region}
                  onChange={(e) => handleFilterChange("region", e.target.value)}
                >
                  <option value="all">Alla regioner</option>
                  {landscapes.map((region) => (
                    <option key={region.id} value={region.name}>
                      {region.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Topics Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Ämnen</label>
                <div className="flex flex-wrap gap-2">
                  {allTopics.slice(0, 8).map((topic) => (
                    <button
                      key={topic}
                      className={`px-3 py-1 rounded-full text-sm ${
                        filters.topics.includes(topic)
                          ? "bg-orange-600 text-white"
                          : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                      }`}
                      onClick={() => handleFilterChange("topics", topic)}
                    >
                      {topic}
                    </button>
                  ))}
                </div>
              </div>

              {/* Positivity Score Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Positivitetsgrad: {Math.round(filters.minScore * 100)}%+
                </label>
                <input
                  type="range"
                  min="0.5"
                  max="1"
                  step="0.05"
                  value={filters.minScore}
                  onChange={(e) => handleFilterChange("minScore", e.target.value)}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <button
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 mr-2"
                onClick={resetFilters}
              >
                Återställ
              </button>
              <button
                className="px-4 py-2 bg-[#e67e22] text-white rounded-md hover:bg-[#d35400] border border-[#f39c12]"
                onClick={() => setShowFilters(false)}
              >
                Tillämpa filter
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-[1000px] mx-auto p-4">
        {/* News Feed with Regional Sidebar */}
        {activeTab === "feed" && (
          <div className="flex flex-col md:flex-row gap-4">
            {/* Main News Feed */}
            <div className="md:w-3/4">
              <h2 className="text-2xl font-bold text-[#4a3520] mb-6">Senaste positiva nyheterna</h2>

              {filteredArticles.length === 0 ? (
                <div className="bg-white p-6 rounded-lg text-center">
                  <p className="text-gray-600">Inga artiklar matchar dina filter. Prova att ändra dina filterval.</p>
                  <button
                    className="mt-4 px-4 py-2 bg-[#e67e22] text-white rounded-md hover:bg-[#d35400] border border-[#f39c12]"
                    onClick={resetFilters}
                  >
                    Återställ filter
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {displayedArticles.map((article) => (
                    <ArticleCard key={article.id} article={article} />
                  ))}

                  {/* Loading indicator and intersection observer target */}
                  <div ref={loaderRef} className="py-4 flex justify-center">
                    {loading && (
                      <div className="w-8 h-8 border-4 border-orange-300 border-t-orange-600 rounded-full animate-spin"></div>
                    )}
                    {!hasMore && displayedArticles.length > 0 && (
                      <p className="text-gray-500">Inga fler artiklar att visa</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Regional Sidebar - Aligned with articles, not the heading */}
            {sidebarSection}
          </div>
        )}

        {/* Trending Topics */}
        {activeTab === "trending" && (
          <div>
            <h2 className="text-2xl font-bold text-[#4a3520] mb-6">Trendande ämnen</h2>

            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h3 className="font-medium text-lg text-[#4a3520] mb-4">Populära ämnen denna vecka</h3>

              <div className="space-y-4">
                {[
                  { topic: "Miljö", count: 87, change: "+12%" },
                  { topic: "Innovation", count: 64, change: "+8%" },
                  { topic: "Hälsa", count: 58, change: "+15%" },
                  { topic: "Forskning", count: 43, change: "+5%" },
                  { topic: "Ekonomi", count: 37, change: "+3%" },
                ].map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border border-gray-100 rounded-md">
                    <span className="font-medium">{item.topic}</span>
                    <div className="flex items-center">
                      <span className="text-gray-500 mr-3">{item.count} artiklar</span>
                      <span className="text-orange-600">{item.change}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-medium text-lg text-[#4a3520] mb-4">Regioner med mest positiva nyheter</h3>

              <div className="space-y-4">
                {landscapes
                  .sort((a, b) => b.positivity - a.positivity)
                  .slice(0, 5)
                  .map((region) => (
                    <div
                      key={region.id}
                      className="flex items-center justify-between p-3 border border-gray-100 rounded-md"
                    >
                      <span className="font-medium">{region.name}</span>
                      <div className="flex items-center">
                        <span className={`px-2 py-1 rounded-full text-xs ${getScoreColor(region.positivity)}`}>
                          +{Math.round(region.positivity * 100)}%
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {/* User Feed */}
        {activeTab === "userfeed" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-[#4a3520]">Användarinlägg</h2>
              <div className="bg-[#f8f3ea] text-[#e67e22] px-3 py-1 rounded-full text-sm font-medium">Kommer snart</div>
            </div>

            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                  <Users size={20} className="text-gray-500" />
                </div>
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Dela något positivt..."
                    className="w-full p-2 border border-gray-300 rounded-md"
                    disabled
                  />
                </div>
                <button className="px-4 py-2 bg-[#e67e22] text-white rounded-md hover:bg-[#d35400] border border-[#f39c12] opacity-50 cursor-not-allowed">
                  Dela
                </button>
              </div>

              <div className="space-y-6">
                {[
                  {
                    id: 1,
                    username: "AnnaS",
                    avatar: "/placeholder.svg?height=40&width=40",
                    date: "2025-03-14",
                    title: "Fantastisk soluppgång vid Turning Torso",
                    content: "Vaknade tidigt för att fånga denna magiska morgon i Malmö. Vilken start på dagen! 🌅",
                    image: "/placeholder.svg?height=400&width=600",
                    likes: 124,
                    comments: 23,
                    shares: 12,
                  },
                  {
                    id: 2,
                    username: "ErikL",
                    avatar: "/placeholder.svg?height=40&width=40",
                    date: "2025-03-13",
                    title: "Lokalt initiativ för renare stränder",
                    content:
                      "Idag samlade vi över 50 personer för att städa Ribersborgsstranden. Tillsammans gör vi skillnad! 💪🌊",
                    image: "/placeholder.svg?height=400&width=600",
                    video: "/placeholder.mp4",
                    likes: 89,
                    comments: 15,
                    shares: 8,
                  },
                ].map((post) => (
                  <div key={post.id} className="border-b border-gray-100 pb-6 last:border-0 last:pb-0">
                    <div className="flex items-start space-x-3">
                      <img
                        src={post.avatar || "/placeholder.svg"}
                        alt={post.username}
                        className="w-10 h-10 rounded-full"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-[#4a3520]">{post.username}</h4>
                          <span className="text-sm text-gray-500">{formatDate(post.date)}</span>
                        </div>
                        <h3 className="font-medium text-lg text-[#4a3520] mt-2">{post.title}</h3>
                        <p className="mt-2 text-gray-800">{post.content}</p>

                        {post.image && (
                          <div className="mt-4 rounded-lg overflow-hidden">
                            <img src={post.image || "/placeholder.svg"} alt={post.title} className="w-full h-auto" />
                          </div>
                        )}

                        {post.video && (
                          <div className="mt-4 rounded-lg overflow-hidden bg-gray-100 aspect-video flex items-center justify-center">
                            <div className="text-gray-500">Video kommer snart</div>
                          </div>
                        )}

                        <div className="mt-4 flex items-center justify-between">
                          <div className="flex items-center space-x-6">
                            <button className="flex items-center space-x-2 text-gray-500 hover:text-orange-600">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                                />
                              </svg>
                              <span>{post.likes}</span>
                            </button>
                            <button className="flex items-center space-x-2 text-gray-500 hover:text-orange-600">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                                />
                              </svg>
                              <span>{post.comments}</span>
                            </button>
                            <button className="flex items-center space-x-2 text-gray-500 hover:text-orange-600">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                                />
                              </svg>
                              <span>Dela</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Regional Explorer */}
        {activeTab === "regional" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-[#4a3520]">Utforska efter landskap</h2>
              <div className="bg-[#f8f3ea] text-[#e67e22] px-3 py-1 rounded-full text-sm font-medium">Kommer snart</div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {landscapes.map((region) => (
                <div key={region.id} className="bg-white rounded-lg shadow p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-medium text-[#4a3520]">{region.name}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs ${getScoreColor(region.positivity)}`}>
                      +{Math.round(region.positivity * 100)}%
                    </span>
                  </div>
                  <p className="text-gray-500 text-sm mb-4">{region.articles} positiva artiklar</p>
                  <button className="w-full py-2 bg-[#e67e22] text-white rounded-md hover:bg-[#d35400] border border-[#f39c12] opacity-50 cursor-not-allowed">
                    Utforska landskap
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Footer with Curated Form */}
      {footerSection}
    </div>
  )
}

