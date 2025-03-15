import { MapPin } from "lucide-react"
import LazyImage from "./lazy-image"

interface Topic {
  id: number
  name: string
}

interface Source {
  id: number
  name: string
}

interface Article {
  id: number
  title: string
  summary: string
  source: Source
  published_date: string
  positivity_score: number
  topics: Topic[]
  region: string
  image_url: string
  url: string
}

interface ArticleCardProps {
  article: Article
}

// Update the article card to use the new color scheme
export default function ArticleCard({ article }: ArticleCardProps) {
  // Function to determine the color based on positivity score
  const getScoreColor = (score: number) => {
    if (score >= 0.9) return "bg-[#e67e22] text-white"
    if (score >= 0.8) return "bg-[#f39c12] text-white"
    if (score >= 0.7) return "bg-[#f5b041] text-[#4a3520]"
    if (score >= 0.6) return "bg-[#f8c471] text-[#4a3520]"
    return "bg-[#fad7a0] text-[#4a3520]"
  }

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("sv-SE", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  return (
    <a
      href={article.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block bg-white rounded-lg shadow overflow-hidden hover:shadow-md transition mb-4"
    >
      {article.image_url && <LazyImage src={article.image_url} alt={article.title} className="h-64 w-full" />}

      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <span className="text-sm text-[#6f4e37]">{article.source.name}</span>
          <span className={`px-2 py-1 rounded-full text-xs ${getScoreColor(article.positivity_score)}`}>
            +{Math.round(article.positivity_score * 100)}%
          </span>
        </div>

        <h3 className="font-medium text-xl mb-3 text-[#4a3520]">{article.title}</h3>

        <p className="text-[#6f4e37] text-base mb-4">{article.summary}</p>

        <div className="flex justify-between items-center">
          <span className="text-xs text-[#967259]">{formatDate(article.published_date)}</span>

          <div className="flex space-x-2">
            {article.region && (
              <span className="flex items-center text-xs text-[#967259]">
                <MapPin size={12} className="mr-1" />
                {article.region}
              </span>
            )}
          </div>
        </div>
      </div>
    </a>
  )
}

