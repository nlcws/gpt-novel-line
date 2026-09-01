# DESIGNER COMMON GATES v0402

## project source gate

Project-specific judgment requires:

1. DS90-side machine search intent.
2. delivered PKDB lookup result.
3. a non-ambiguous schema-legal current SOURCE locator whose `payload.locator` is a safe current-mount relative path.
4. exact K04 current shelf byte read and SHA verification.
5. actual textual read when the shelf source is textual.

PKDB TAG/alias/SOURCE locator metadata is never sufficient project evidence by itself.

## archive/fallback gate

URI or archive SOURCE locators are not current shelf authority. They may enter K02 SOURCE_MATERIALIZE only when fallback was explicitly enabled and its hardened proof completes.

## shelf restore gate

021_G / 022_B / 024_V / 028_H are normal project shelves. Their physical existence is not obsolete merely because PKDB exists.

## HOLD gate

HOLD / UNKNOWN / unresolved relations remain non-confirmed after search.

## input gate

DS90 may emit proposal-only PKDB inputs. Standard v0402 locator maintenance uses schema-legal SOURCE locator records plus TAG/search terms/aliases; it does not reconstruct full project prose. Commit stays outside DS90 and belongs to MT00/Nul.


## 000_C shrine gate

Normal `000_C` operation is USE_ONLY. DS90 may present a required control-shelf maintenance action, but it may not rebuild/replace `000_C` until the user explicitly requests the maintenance or explicitly approves the presented target/reason/change-scope.

MOUNT_TRANSFER is USER_EXPLICIT only. Detection and recommendation do not activate MT00.
