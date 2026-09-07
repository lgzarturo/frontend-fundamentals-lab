import { generateId } from "../../utils/id.js"

export class Note {
  constructor(data = {}) {
    this.id = data.id || generateId()
    this.title = data.title || ""
    this.bodyMarkdown = data.bodyMarkdown || ""
    this.tags = Array.isArray(data.tags) ? [...data.tags] : []
    this.createdAt = data.createdAt || Date.now()
    this.updatedAt = data.updatedAt || Date.now()
  }

  getPreview(maxLength = 100) {
    if (!this.bodyMarkdown) return ""
    const stripped = this.bodyMarkdown
      .replace(/```[\s\S]*?```/g, "")
      .replace(/!\[(.*?)\]\(.*?\)/g, "$1")
      .replace(/\[(.*?)\]\(.*?\)/g, "$1")
      .replace(/[#*_`[\]>~-]/g, "")
      .replace(/\s+/g, " ")
      .trim()

    return stripped.length > maxLength
      ? stripped.slice(0, maxLength) + "..."
      : stripped
  }

  matchesSearch(query) {
    if (!query) return true
    const q = query.toLowerCase()
    return (
      this.title.toLowerCase().includes(q) ||
      this.bodyMarkdown.toLowerCase().includes(q) ||
      this.tags.some(tag => tag.toLowerCase().includes(q))
    )
  }

  touch() {
    this.updatedAt = Date.now()
  }

  toJSON() {
    return {
      id: this.id,
      title: this.title,
      bodyMarkdown: this.bodyMarkdown,
      tags: [...this.tags],
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    }
  }

  static fromJSON(data) {
    return new Note(data)
  }

  static validate(data) {
    const errors = []
    if (!data.title?.trim()) {
      errors.push("Title is required")
    }
    return errors
  }
}
