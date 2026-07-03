export type SearchableCondition = {
  title: string
  category: string
  description: string
}

function tokenize(text: string) {
  return text
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean)
}

function getSearchTokens(query: string) {
  return tokenize(query.trim())
}

function wordMatchesToken(word: string, token: string) {
  return word === token || (token.length >= 4 && word.startsWith(token))
}

function fieldMatchesToken(field: string, token: string) {
  return tokenize(field).some((word) => wordMatchesToken(word, token))
}

function scoreTokenMatch(condition: SearchableCondition, token: string) {
  if (fieldMatchesToken(condition.title, token)) {
    let score = 100

    if (condition.title.toLowerCase().startsWith(token)) {
      score += 40
    }

    return score
  }

  if (fieldMatchesToken(condition.category, token)) {
    return 50
  }

  if (fieldMatchesToken(condition.description, token)) {
    return 20
  }

  return 0
}

export function scoreConditionSearch(condition: SearchableCondition, query: string) {
  const tokens = getSearchTokens(query)

  if (!tokens.length) {
    return 0
  }

  let totalScore = 0

  for (const token of tokens) {
    const tokenScore = scoreTokenMatch(condition, token)

    if (!tokenScore) {
      return 0
    }

    totalScore += tokenScore
  }

  const normalizedQuery = query.trim().toLowerCase()

  if (condition.title.toLowerCase().includes(normalizedQuery)) {
    totalScore += 30
  }

  return totalScore
}

export function filterAndRankConditions<T extends SearchableCondition>(conditions: T[], query: string) {
  const normalized = query.trim()

  if (!normalized) {
    return conditions
  }

  return conditions
    .map((condition) => ({
      condition,
      score: scoreConditionSearch(condition, normalized)
    }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score
      }

      return a.condition.title.localeCompare(b.condition.title)
    })
    .map(({ condition }) => condition)
}
