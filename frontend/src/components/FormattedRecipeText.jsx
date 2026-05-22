function FormattedRecipeText({ text }) {
  const parts = String(text ?? '').split(/(\*\*[^*]+\*\*)/g)

  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={`${part}-${index}`} className="font-semibold text-gray-900">
          {part.slice(2, -2)}
        </strong>
      )
    }

    return part.replace(/\*/g, '')
  })
}

export default FormattedRecipeText
