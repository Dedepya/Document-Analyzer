# DocuLens - AI Document Insights

DocuLens is an intelligent document analysis tool powered by Google's Gemini 3 Flash model. It allows users to upload documents (PDF, DOCX, TXT, Images) to extract structured data, generate summaries, and chat with their content.

## Features

- **Multi-format Support**: Analyze PDFs, Word documents, Text files, and Images.
- **AI-Powered Analysis**: Uses Gemini 3 Flash for deep understanding of document content.
- **Interactive Chat**: Ask questions about your documents and get instant answers.
- **Data Extraction**: Automatically extracts key information and structured data.
- **Summarization**: Get concise summaries of long documents.

## Tech Stack

- **Frontend**: React 19, Vite, TypeScript
- **Styling**: Tailwind CSS
- **AI Model**: Google Gemini 3 Flash (@google/genai)
- **Document Processing**: Mammoth (DOCX), Native File API

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- A Google Gemini API Key

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/yourusername/doculens.git
    cd doculens
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

3.  Set up environment variables:
    - Create a `.env` file in the root directory.
    - Add your Gemini API key:
      ```env
      VITE_GEMINI_API_KEY=your_api_key_here
      ```

4.  Start the development server:
    ```bash
    npm run dev
    ```

## Deployment

### GitHub Pages (Automated via GitHub Actions)

This project is configured to automatically deploy to GitHub Pages every time you push code to the `main` or `master` branch.

#### 1. Configure GitHub Repository Permissions
To allow GitHub Actions to automatically deploy to your `gh-pages` branch, you need to enable Write permissions:
1. Go to your repository on GitHub.
2. Click on **Settings** (gear icon) -> **Actions** -> **General**.
3. Scroll down to **Workflow permissions**.
4. Select **Read and write permissions** and click **Save**.

#### 2. Configure GitHub Pages Source
1. Go to your repository on GitHub.
2. Click on **Settings** -> **Pages**.
3. Under **Build and deployment** -> **Source**, make sure it is set to **Deploy from a branch**.
4. Set the **Branch** to **`gh-pages`** and the folder to **`/ (root)`**, then click **Save**. (Note: The `gh-pages` branch will be automatically created by the GitHub Action workflow after your first push).

#### 3. Update Configuration URL
1. Update `package.json`:
   - Set `"homepage": "https://<your-username>.github.io/<repo-name>"`

Your application will now build and deploy automatically whenever you push to GitHub!

## License

MIT
