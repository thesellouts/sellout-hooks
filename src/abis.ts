import ArtistRegistry from '@thesellouts/sellout-protocol/abis/ArtistRegistry.json'
import BoxOffice from '@thesellouts/sellout-protocol/abis/BoxOffice.json'
import OrganizerRegistry from '@thesellouts/sellout-protocol/abis/OrganizerRegistry.json'
import Referral from '@thesellouts/sellout-protocol/abis/ReferralModule.json'
import Show from '@thesellouts/sellout-protocol/abis/Show.json'
import ShowVault from '@thesellouts/sellout-protocol/abis/ShowVault.json'
import Ticket from '@thesellouts/sellout-protocol/abis/Ticket.json'
import Venue from '@thesellouts/sellout-protocol/abis/Venue.json'
import VenueRegistry from '@thesellouts/sellout-protocol/abis/VenueRegistry.json'

export const ShowABI = [...Show.abi] as const
export const TicketABI = [...Ticket.abi] as const
export const VenueABI = [...Venue.abi] as const
export const ShowVaultABI = [...ShowVault.abi] as const
export const VenueRegistryABI = [...VenueRegistry.abi] as const
export const OrganizerRegistryABI = [...OrganizerRegistry.abi] as const
export const ArtistRegistryABI = [...ArtistRegistry.abi] as const
export const ReferralABI = [...Referral.abi] as const

export const BoxOfficeABI = [...BoxOffice.abi] as const
