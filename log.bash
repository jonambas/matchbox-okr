git log \
  --numstat \
  --format='%ad' \
  --date=short \
  -- '*.scss' \
  $@ | \
  perl -lawne '
      if (defined $F[1]) {
          print qq#{"insertions": "$F[0]", "deletions": "$F[1]", "path": "$F[2]"},#
      } elsif (defined $F[0]) {
          print qq#]},\n{"date": "$F[0]",\n"changes": [#
      };
      END{print qq#]}#}' | \
  tail -n +2 | \
  perl -wpe 'BEGIN{print "["}; END{print "]"}' | \
  tr '\n' ' ' | \
  perl -wpe 's#(]|}),\s*(]|})#$1$2#g' | \
  perl -wpe 's#,\s*?}$#}#'  > ~/src/projects/matchbox-okr/src/raw-data/scss.json
