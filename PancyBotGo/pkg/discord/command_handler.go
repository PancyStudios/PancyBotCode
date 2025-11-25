// Package discord provides the command handler for loading and registering commands.
package discord

import (
	"github.com/PancyStudios/PancyBotCode/PancyBotGo/pkg/config"
	"github.com/PancyStudios/PancyBotCode/PancyBotGo/pkg/logger"
	"github.com/bwmarrin/discordgo"
)

// CommandHandler manages command loading and registration
type CommandHandler struct {
	client          *ExtendedClient
	slashCommands   []*discordgo.ApplicationCommand
	slashCommandsDev []*discordgo.ApplicationCommand
}

// NewCommandHandler creates a new CommandHandler
func NewCommandHandler(client *ExtendedClient) *CommandHandler {
	return &CommandHandler{
		client:          client,
		slashCommands:   make([]*discordgo.ApplicationCommand, 0),
		slashCommandsDev: make([]*discordgo.ApplicationCommand, 0),
	}
}

// LoadCommands loads all commands from the commands registry
// In Go, we register commands programmatically instead of reading from files
func (ch *CommandHandler) LoadCommands() error {
	logger.System("Iniciando carga de comandos...", "CommandHandler")

	// Commands are registered programmatically using RegisterCommand
	// Example commands can be added here or in separate packages

	logger.System("Carga finalizada. Los comandos se registrarán programáticamente.", "CommandHandler")
	return nil
}

// RegisterCommand adds a command to the handler
func (ch *CommandHandler) RegisterCommand(cmd *Command) {
	ch.client.Commands.Set(cmd.Name, cmd)

	appCmd := cmd.ToApplicationCommand()

	if cmd.IsDev {
		ch.slashCommandsDev = append(ch.slashCommandsDev, appCmd)
	} else {
		ch.slashCommands = append(ch.slashCommands, appCmd)
	}

	logger.Debug("Comando registrado: "+cmd.Name, "CommandHandler")
}

// RegisterSubcommand adds a subcommand to an existing command group
func (ch *CommandHandler) RegisterSubcommand(groupName string, cmd *Command) {
	fullName := groupName + "." + cmd.Name
	ch.client.Commands.Set(fullName, cmd)
	logger.Debug("Subcomando registrado: "+fullName, "CommandHandler")
}

// RegisterSubcommandGroup adds a subcommand group
func (ch *CommandHandler) RegisterSubcommandGroup(groupName, subgroupName string, cmd *Command) {
	fullName := groupName + "." + subgroupName + "." + cmd.Name
	ch.client.Commands.Set(fullName, cmd)
	logger.Debug("Subcomando de grupo registrado: "+fullName, "CommandHandler")
}

// BuildCommandGroup creates a command group with subcommands
func (ch *CommandHandler) BuildCommandGroup(name, description string, subcommands ...*Command) *discordgo.ApplicationCommand {
	options := make([]*discordgo.ApplicationCommandOption, 0, len(subcommands))

	for _, cmd := range subcommands {
		fullName := name + "." + cmd.Name
		ch.client.Commands.Set(fullName, cmd)

		opt := &discordgo.ApplicationCommandOption{
			Type:        discordgo.ApplicationCommandOptionSubCommand,
			Name:        cmd.Name,
			Description: cmd.Description,
			Options:     cmd.Options,
		}
		options = append(options, opt)
	}

	return &discordgo.ApplicationCommand{
		Name:        name,
		Description: description,
		Options:     options,
	}
}

// BuildSubcommandGroup creates a subcommand group
func (ch *CommandHandler) BuildSubcommandGroup(groupName, name, description string, subcommands ...*Command) *discordgo.ApplicationCommandOption {
	options := make([]*discordgo.ApplicationCommandOption, 0, len(subcommands))

	for _, cmd := range subcommands {
		fullName := groupName + "." + name + "." + cmd.Name
		ch.client.Commands.Set(fullName, cmd)

		opt := &discordgo.ApplicationCommandOption{
			Type:        discordgo.ApplicationCommandOptionSubCommand,
			Name:        cmd.Name,
			Description: cmd.Description,
			Options:     cmd.Options,
		}
		options = append(options, opt)
	}

	return &discordgo.ApplicationCommandOption{
		Type:        discordgo.ApplicationCommandOptionSubCommandGroup,
		Name:        name,
		Description: description,
		Options:     options,
	}
}

// RegisterCommands registers all slash commands with Discord
func (ch *CommandHandler) RegisterCommands() {
	cfg := config.Get()

	logger.Info("🔄 Registrando comandos globales...", "CommandHandler")

	// Register global commands
	for _, cmd := range ch.slashCommands {
		_, err := ch.client.Session.ApplicationCommandCreate(
			ch.client.Session.State.User.ID,
			"",
			cmd,
		)
		if err != nil {
			logger.Error("Error registrando comando "+cmd.Name+": "+err.Error(), "CommandHandler")
		}
	}

	logger.Success("✅ Comandos globales registrados.", "CommandHandler")

	// Register dev commands in dev guild
	if cfg.DevGuildID != "" && len(ch.slashCommandsDev) > 0 {
		logger.Info("🔄 Registrando comandos de desarrollo en el servidor "+cfg.DevGuildID+"...", "CommandHandler")

		for _, cmd := range ch.slashCommandsDev {
			_, err := ch.client.Session.ApplicationCommandCreate(
				ch.client.Session.State.User.ID,
				cfg.DevGuildID,
				cmd,
			)
			if err != nil {
				logger.Error("Error registrando comando de desarrollo "+cmd.Name+": "+err.Error(), "CommandHandler")
			}
		}

		logger.Success("✅ Comandos de desarrollo registrados.", "CommandHandler")
	}
}

// UnregisterCommands removes all registered commands from Discord
func (ch *CommandHandler) UnregisterCommands() error {
	commands, err := ch.client.Session.ApplicationCommands(ch.client.Session.State.User.ID, "")
	if err != nil {
		return err
	}

	for _, cmd := range commands {
		err := ch.client.Session.ApplicationCommandDelete(ch.client.Session.State.User.ID, "", cmd.ID)
		if err != nil {
			logger.Error("Error eliminando comando "+cmd.Name+": "+err.Error(), "CommandHandler")
		}
	}

	logger.Success("Comandos globales eliminados.", "CommandHandler")
	return nil
}

// AddGlobalCommand adds a command to the global command list
func (ch *CommandHandler) AddGlobalCommand(cmd *discordgo.ApplicationCommand) {
	ch.slashCommands = append(ch.slashCommands, cmd)
}

// AddDevCommand adds a command to the dev command list
func (ch *CommandHandler) AddDevCommand(cmd *discordgo.ApplicationCommand) {
	ch.slashCommandsDev = append(ch.slashCommandsDev, cmd)
}
