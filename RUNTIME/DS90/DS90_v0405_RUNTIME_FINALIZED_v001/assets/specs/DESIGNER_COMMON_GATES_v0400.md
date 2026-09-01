# DESIGNER COMMON GATES v0400 (RETAINED BASE)

STATUS: RETAINED_BASE / v0401 locator representation supersedes the `shelf_pointer` field sketch.

## project source gate

Project-specific judgment requires:

1. DS90-side machine search intent.
2. delivered PKDB locator lookup.
3. non-ambiguous current `shelf_pointer`.
4. exact current shelf byte read and SHA verification.
5. actual textual read when the shelf source is textual.

PKDB tag records are never sufficient project evidence by themselves.

## shelf restore gate

021_G / 022_B / 024_V / 028_H are normal project shelves. Their physical existence is not obsolete merely because PKDB exists.

## HOLD gate

HOLD / UNKNOWN / unresolved relations remain non-confirmed after search.

## input gate

DS90 may emit proposal-only PKDB inputs. Standard v0400 inputs are locator/tag maintenance, not reconstructed full project prose. Commit stays outside DS90.
