import Table from 'cli-table3'
import { wrap } from './utils/string'

/**
 * Wraps the second column in a list of 2-column cli-table rows.
 *
 * @param rows - the target rows.
 * @returns the same rows, but wrapped
 */
function wrapRows(rows: string[][]): string[][] {
  const len = rows.length
  for (let i = 0; i < len; i++) {
    const row = rows[i]
    rows[i] = [row[0], wrap(row[1] ?? '')]
  }
  return rows
}

/**
 * Renders a html table row from an array of string.
 *
 * @param cells - the data for the row cells.
 * @returns the html string of the table row.
 */
function row(cells: string[]): string {
  let html = '\n  <tr>'
  for (const cell in cells) html += `<td>${cell}</td>`
  html += '</tr>'
  return html
}

/** Renders a table for the CLI or markdown. */
const table = ({
  colAligns,
  markdown,
  rows,
}: {
  colAligns?: ('left' | 'right')[]
  markdown?: boolean
  rows: string[][]
}): string => {
  // return HTML table for Github-flavored markdown
  if (markdown) {
    return `<table>${rows.map(row).join('')}\n</table>`
  }
  // otherwise use cli-table3
  else {
    const t = new Table(colAligns ? { colAligns } : undefined)
    t.concat(markdown ? rows : wrapRows(rows))
    return t.toString()
  }
}

export default table
