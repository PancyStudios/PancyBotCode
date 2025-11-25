// Package discord provides the event handler for managing Discord events.
package discord

import (
	"github.com/PancyStudios/PancyBotCode/PancyBotGo/pkg/logger"
	"github.com/bwmarrin/discordgo"
)

// EventHandler manages event loading and registration
type EventHandler struct {
	client *ExtendedClient
	events []interface{}
}

// Event represents a Discord event with its handler
type Event struct {
	Name    string
	Handler interface{}
}

// NewEventHandler creates a new EventHandler
func NewEventHandler(client *ExtendedClient) *EventHandler {
	return &EventHandler{
		client: client,
		events: make([]interface{}, 0),
	}
}

// LoadEvents loads all events from the events registry
// In Go, we register events programmatically instead of reading from files
func (eh *EventHandler) LoadEvents() error {
	logger.System("Iniciando carga de eventos...", "EventHandler")

	// Events are registered programmatically using RegisterEvent
	// Example events can be added here or in separate packages

	logger.System("Carga finalizada. Los eventos se registrarán programáticamente.", "EventHandler")
	return nil
}

// RegisterEvent adds an event handler to the Discord session
func (eh *EventHandler) RegisterEvent(handler interface{}) {
	eh.client.Session.AddHandler(handler)
	eh.events = append(eh.events, handler)
	logger.Debug("Evento registrado", "EventHandler")
}

// Event handler types for common Discord events

// ReadyHandler is called when the bot is ready
type ReadyHandler func(s *discordgo.Session, r *discordgo.Ready)

// GuildCreateHandler is called when the bot joins a guild
type GuildCreateHandler func(s *discordgo.Session, g *discordgo.GuildCreate)

// GuildDeleteHandler is called when the bot leaves a guild
type GuildDeleteHandler func(s *discordgo.Session, g *discordgo.GuildDelete)

// MessageCreateHandler is called when a message is created
type MessageCreateHandler func(s *discordgo.Session, m *discordgo.MessageCreate)

// MessageUpdateHandler is called when a message is updated
type MessageUpdateHandler func(s *discordgo.Session, m *discordgo.MessageUpdate)

// MessageDeleteHandler is called when a message is deleted
type MessageDeleteHandler func(s *discordgo.Session, m *discordgo.MessageDelete)

// GuildMemberAddHandler is called when a member joins a guild
type GuildMemberAddHandler func(s *discordgo.Session, m *discordgo.GuildMemberAdd)

// GuildMemberRemoveHandler is called when a member leaves a guild
type GuildMemberRemoveHandler func(s *discordgo.Session, m *discordgo.GuildMemberRemove)

// GuildMemberUpdateHandler is called when a member is updated
type GuildMemberUpdateHandler func(s *discordgo.Session, m *discordgo.GuildMemberUpdate)

// VoiceStateUpdateHandler is called when a voice state is updated
type VoiceStateUpdateHandler func(s *discordgo.Session, v *discordgo.VoiceStateUpdate)

// InteractionCreateHandler is called when an interaction is created
type InteractionCreateHandler func(s *discordgo.Session, i *discordgo.InteractionCreate)

// Helper functions to register common event types

// OnReady registers a ready event handler
func (eh *EventHandler) OnReady(handler ReadyHandler) {
	eh.RegisterEvent(handler)
	logger.Debug("Evento 'Ready' registrado", "EventHandler")
}

// OnGuildCreate registers a guild create event handler
func (eh *EventHandler) OnGuildCreate(handler GuildCreateHandler) {
	eh.RegisterEvent(handler)
	logger.Debug("Evento 'GuildCreate' registrado", "EventHandler")
}

// OnGuildDelete registers a guild delete event handler
func (eh *EventHandler) OnGuildDelete(handler GuildDeleteHandler) {
	eh.RegisterEvent(handler)
	logger.Debug("Evento 'GuildDelete' registrado", "EventHandler")
}

// OnMessageCreate registers a message create event handler
func (eh *EventHandler) OnMessageCreate(handler MessageCreateHandler) {
	eh.RegisterEvent(handler)
	logger.Debug("Evento 'MessageCreate' registrado", "EventHandler")
}

// OnMessageUpdate registers a message update event handler
func (eh *EventHandler) OnMessageUpdate(handler MessageUpdateHandler) {
	eh.RegisterEvent(handler)
	logger.Debug("Evento 'MessageUpdate' registrado", "EventHandler")
}

// OnMessageDelete registers a message delete event handler
func (eh *EventHandler) OnMessageDelete(handler MessageDeleteHandler) {
	eh.RegisterEvent(handler)
	logger.Debug("Evento 'MessageDelete' registrado", "EventHandler")
}

// OnGuildMemberAdd registers a guild member add event handler
func (eh *EventHandler) OnGuildMemberAdd(handler GuildMemberAddHandler) {
	eh.RegisterEvent(handler)
	logger.Debug("Evento 'GuildMemberAdd' registrado", "EventHandler")
}

// OnGuildMemberRemove registers a guild member remove event handler
func (eh *EventHandler) OnGuildMemberRemove(handler GuildMemberRemoveHandler) {
	eh.RegisterEvent(handler)
	logger.Debug("Evento 'GuildMemberRemove' registrado", "EventHandler")
}

// OnGuildMemberUpdate registers a guild member update event handler
func (eh *EventHandler) OnGuildMemberUpdate(handler GuildMemberUpdateHandler) {
	eh.RegisterEvent(handler)
	logger.Debug("Evento 'GuildMemberUpdate' registrado", "EventHandler")
}

// OnVoiceStateUpdate registers a voice state update event handler
func (eh *EventHandler) OnVoiceStateUpdate(handler VoiceStateUpdateHandler) {
	eh.RegisterEvent(handler)
	logger.Debug("Evento 'VoiceStateUpdate' registrado", "EventHandler")
}

// OnInteractionCreate registers an interaction create event handler
func (eh *EventHandler) OnInteractionCreate(handler InteractionCreateHandler) {
	eh.RegisterEvent(handler)
	logger.Debug("Evento 'InteractionCreate' registrado", "EventHandler")
}
