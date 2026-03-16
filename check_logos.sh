#!/bin/bash
repos=("DataSQuirreL" "PrismPlay" "my-coding-fonts" "remix-ide" "micro")
for repo in "${repos[@]}"; do
  echo "Checking $repo..."
  desc=$(curl -s "https://api.github.com/repos/Ayanrocks/$repo" | grep -i '"description":')
  echo "$desc"
  
  for branch in main master; do
    for file in logo.png icon.png logo.svg icon.svg logo.jpg icon.jpg; do
      status=$(curl -o /dev/null -s -w "%{http_code}\n" "https://raw.githubusercontent.com/Ayanrocks/$repo/$branch/$file")
      if [ "$status" -eq 200 ]; then
        echo "Found $file in $branch of $repo"
        curl -s -o "assets/${repo}_cover.png" "https://raw.githubusercontent.com/Ayanrocks/$repo/$branch/$file"
        break 2
      fi
    done
  done
  echo "No logo found for $repo"
done
