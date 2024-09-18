import xml.etree.ElementTree as ET

def generate_publications_html(xml_file_path):
    try:
        # Parse the XML file
        tree = ET.parse(xml_file_path)
        root = tree.getroot()

        # Initialize HTML content with ordered list
        html_content = "<ol>\n"

        # Iterate over all 'article' and 'inproceedings' elements
        for publication in root.findall(".//r/article") + root.findall(".//r/inproceedings"):
            authors = [author.text for author in publication.findall('author')]
            title = publication.find('title').text if publication.find('title') is not None else ''
            year = publication.find('year').text if publication.find('year') is not None else ''
            journal = publication.find('journal').text if publication.find('journal') is not None else \
                      publication.find('booktitle').text if publication.find('booktitle') is not None else ''
            pages = publication.find('pages').text if publication.find('pages') is not None else ''
            doi = publication.find('ee').text if publication.find('ee') is not None else ''

            # Highlight "Lorenzo Palazzetti" in authors list
            authors_text = ', '.join(f'<b>{author}</b>' if author == 'Lorenzo Palazzetti' else author for author in authors)

            # Construct the publication line
            publication_text = f'{authors_text}. "{title}". {journal} ({year}) {pages}. DOI: <a href="{doi}" target="_blank">{doi}</a>'

            # Add publication to the HTML content as a list item
            html_content += f'  <li class="publication">{publication_text}</li>\n'

        # Close the ordered list
        html_content += "</ol>\n"

        return html_content

    except ET.ParseError as parse_error:
        print(f"XML parsing error: {parse_error}")
        return ""
    except FileNotFoundError:
        print(f"File not found: {xml_file_path}")
        return ""
    except Exception as e:
        print(f"An error occurred: {e}")
        return ""

# Example usage
xml_file_path = 'bib.xml'
html_content = generate_publications_html(xml_file_path)
print(html_content)
