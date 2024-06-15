import ArtistRegistry from '@lucidlabs/sellout-protocol/abis/ArtistRegistry.json'
import BoxOffice from '@lucidlabs/sellout-protocol/abis/BoxOffice.json'
import OrganizerRegistry from '@lucidlabs/sellout-protocol/abis/OrganizerRegistry.json'
import Referral from '@lucidlabs/sellout-protocol/abis/ReferralModule.json'
import Show from '@lucidlabs/sellout-protocol/abis/Show.json'
import ShowVault from '@lucidlabs/sellout-protocol/abis/ShowVault.json'
import Ticket from '@lucidlabs/sellout-protocol/abis/Ticket.json'
import Venue from '@lucidlabs/sellout-protocol/abis/Venue.json'
import VenueRegistry from '@lucidlabs/sellout-protocol/abis/VenueRegistry.json'

export const ShowABI = [...Show.abi] as const
export const TicketABI = [...Ticket.abi] as const
export const VenueABI = [...Venue.abi] as const
export const ShowVaultABI = [...ShowVault.abi] as const
export const VenueRegistryABI = [...VenueRegistry.abi] as const
export const OrganizerRegistryABI = [...OrganizerRegistry.abi] as const
export const ArtistRegistryABI = [...ArtistRegistry.abi] as const
export const ReferralABI = [...Referral.abi] as const

export const BoxOfficeABI = [...BoxOffice.abi] as const
