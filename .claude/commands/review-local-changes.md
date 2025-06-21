Please review the local changes based on the GitHub issue: $ARGUMENTS.

Follow these steps:

1. Check the changes of the local branch compared with the main branch
2. Use gh to get the issue details: $ARGUMENTS
3. Understand the problem described in the issue
4. Review the changes of the local branch
5. Create a review feedback file in the project's reviews directory:
   - Create directory if not exists: `mkdir -p reviews`
   - File name format: `reviews/issue-{issue_number}-review.md`
   - Write the review in Japanese
   - Include these sections:
     * ## 概要 (Summary)
     * ## 変更内容の確認 (Changes Review)
     * ## 問題の解決状況 (Problem Resolution Status)
     * ## 改善提案 (Improvement Suggestions)
     * ## 総評 (Overall Assessment)

Remember to use the GitHub CLI (gh) for all GitHub-related tasks.

