const useModeration = () => {
  const API_KEY = process.env.EXPO_PUBLIC_API_KEY
  const checkContentModeration = async (content: string) => {
    try {
      const response = await fetch('https://api.openai.com/v1/moderations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${API_KEY}`,
        },
        body: JSON.stringify({ input: content }),
      })

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error moderating content:', error)
      return null
    }
  }

  return { checkContentModeration }
}

export default useModeration
