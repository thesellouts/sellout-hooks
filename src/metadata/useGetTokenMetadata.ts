import { useEffect, useState } from 'react'

interface MetadataContent {
  mime: string
  uri: string
}

interface MetadataProperty {
  showName: string
  organizer: string
  venueName: string
  currency: string
}

interface MetadataAttribute {
  trait_type: string
  value: string | number
}

interface Metadata {
  name: string
  description: string
  image: string
  content: MetadataContent
  properties: MetadataProperty
  attributes: MetadataAttribute[]
}

// Define the state and return types for useGetTokenMetadata
interface UseTokenMetadataState {
  metadata: Metadata | null
  loading: boolean
  error: string | null
}

export const useGetTokenMetadata = (
  showId: string,
  tokenId: string
): UseTokenMetadataState => {
  const [metadata, setMetadata] = useState<Metadata | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!showId || !tokenId) return

    const fetchMetadata = async () => {
      setLoading(true)
      setError(null)
      try {
        const url = `https://metadata.sellouts.app/show/${showId}/${tokenId}`
        const response = await fetch(url)
        if (!response.ok) {
          throw new Error(
            `Failed to fetch: ${response.status} ${response.statusText}`
          )
        }
        const data: Metadata = await response.json()
        setMetadata(data)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchMetadata()
  }, [showId, tokenId])

  return { metadata, loading, error }
}
