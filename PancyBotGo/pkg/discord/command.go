// Package discord provides command types and structures.
package discord

import (
	"github.com/bwmarrin/discordgo"
)

// CommandContext provides context for command execution
type CommandContext struct {
	Session     *discordgo.Session
	Interaction *discordgo.InteractionCreate
	Client      *ExtendedClient
}

// Command represents a Discord slash command
type Command struct {
	Name            string
	Description     string
	Category        string
	Options         []*discordgo.ApplicationCommandOption
	UserPermissions int64
	BotPermissions  int64
	IsDev           bool
	InVoiceChannel  bool
	RequiresDB      bool
	Run             CommandRunFunc
	AutoComplete    AutoCompleteFunc
}

// CommandRunFunc is the function type for command execution
type CommandRunFunc func(ctx *CommandContext) error

// AutoCompleteFunc is the function type for autocomplete handling
type AutoCompleteFunc func(ctx *CommandContext)

// NewCommand creates a new Command with required fields
func NewCommand(name, description, category string, run CommandRunFunc) *Command {
	return &Command{
		Name:        name,
		Description: description,
		Category:    category,
		Run:         run,
	}
}

// WithOptions sets the command options
func (c *Command) WithOptions(opts ...*discordgo.ApplicationCommandOption) *Command {
	c.Options = opts
	return c
}

// WithUserPermissions sets required user permissions
func (c *Command) WithUserPermissions(perms int64) *Command {
	c.UserPermissions = perms
	return c
}

// WithBotPermissions sets required bot permissions
func (c *Command) WithBotPermissions(perms int64) *Command {
	c.BotPermissions = perms
	return c
}

// AsDev marks the command as a dev-only command
func (c *Command) AsDev() *Command {
	c.IsDev = true
	return c
}

// RequiresVoice marks the command as requiring the user to be in a voice channel
func (c *Command) RequiresVoice() *Command {
	c.InVoiceChannel = true
	return c
}

// RequiresDatabase marks the command as requiring database access
func (c *Command) RequiresDatabase() *Command {
	c.RequiresDB = true
	return c
}

// WithAutoComplete sets the autocomplete handler
func (c *Command) WithAutoComplete(fn AutoCompleteFunc) *Command {
	c.AutoComplete = fn
	return c
}

// ToApplicationCommand converts the command to a Discord application command
func (c *Command) ToApplicationCommand() *discordgo.ApplicationCommand {
	return &discordgo.ApplicationCommand{
		Name:        c.Name,
		Description: c.Description,
		Options:     c.Options,
	}
}

// Reply sends a reply to the interaction
func (ctx *CommandContext) Reply(content string) error {
	return ctx.Session.InteractionRespond(ctx.Interaction.Interaction, &discordgo.InteractionResponse{
		Type: discordgo.InteractionResponseChannelMessageWithSource,
		Data: &discordgo.InteractionResponseData{
			Content: content,
		},
	})
}

// ReplyEmbed sends an embed reply to the interaction
func (ctx *CommandContext) ReplyEmbed(embed *discordgo.MessageEmbed) error {
	return ctx.Session.InteractionRespond(ctx.Interaction.Interaction, &discordgo.InteractionResponse{
		Type: discordgo.InteractionResponseChannelMessageWithSource,
		Data: &discordgo.InteractionResponseData{
			Embeds: []*discordgo.MessageEmbed{embed},
		},
	})
}

// ReplyEphemeral sends an ephemeral reply visible only to the user
func (ctx *CommandContext) ReplyEphemeral(content string) error {
	return ctx.Session.InteractionRespond(ctx.Interaction.Interaction, &discordgo.InteractionResponse{
		Type: discordgo.InteractionResponseChannelMessageWithSource,
		Data: &discordgo.InteractionResponseData{
			Content: content,
			Flags:   discordgo.MessageFlagsEphemeral,
		},
	})
}

// Defer defers the interaction response
func (ctx *CommandContext) Defer() error {
	return ctx.Session.InteractionRespond(ctx.Interaction.Interaction, &discordgo.InteractionResponse{
		Type: discordgo.InteractionResponseDeferredChannelMessageWithSource,
	})
}

// EditReply edits the original interaction response
func (ctx *CommandContext) EditReply(content string) error {
	_, err := ctx.Session.InteractionResponseEdit(ctx.Interaction.Interaction, &discordgo.WebhookEdit{
		Content: &content,
	})
	return err
}

// EditReplyEmbed edits the original interaction response with an embed
func (ctx *CommandContext) EditReplyEmbed(embed *discordgo.MessageEmbed) error {
	_, err := ctx.Session.InteractionResponseEdit(ctx.Interaction.Interaction, &discordgo.WebhookEdit{
		Embeds: &[]*discordgo.MessageEmbed{embed},
	})
	return err
}

// GetOption retrieves an option value by name
func (ctx *CommandContext) GetOption(name string) *discordgo.ApplicationCommandInteractionDataOption {
	options := ctx.Interaction.ApplicationCommandData().Options
	return findOption(options, name)
}

// findOption recursively finds an option by name
func findOption(options []*discordgo.ApplicationCommandInteractionDataOption, name string) *discordgo.ApplicationCommandInteractionDataOption {
	for _, opt := range options {
		if opt.Name == name {
			return opt
		}
		if len(opt.Options) > 0 {
			if found := findOption(opt.Options, name); found != nil {
				return found
			}
		}
	}
	return nil
}

// GetStringOption retrieves a string option value
func (ctx *CommandContext) GetStringOption(name string) string {
	opt := ctx.GetOption(name)
	if opt == nil {
		return ""
	}
	return opt.StringValue()
}

// GetIntOption retrieves an integer option value
func (ctx *CommandContext) GetIntOption(name string) int64 {
	opt := ctx.GetOption(name)
	if opt == nil {
		return 0
	}
	return opt.IntValue()
}

// GetBoolOption retrieves a boolean option value
func (ctx *CommandContext) GetBoolOption(name string) bool {
	opt := ctx.GetOption(name)
	if opt == nil {
		return false
	}
	return opt.BoolValue()
}

// GetUserOption retrieves a user option value
func (ctx *CommandContext) GetUserOption(name string) *discordgo.User {
	opt := ctx.GetOption(name)
	if opt == nil {
		return nil
	}
	return opt.UserValue(ctx.Session)
}

// GetChannelOption retrieves a channel option value
func (ctx *CommandContext) GetChannelOption(name string) *discordgo.Channel {
	opt := ctx.GetOption(name)
	if opt == nil {
		return nil
	}
	return opt.ChannelValue(ctx.Session)
}

// GetRoleOption retrieves a role option value
func (ctx *CommandContext) GetRoleOption(name string) *discordgo.Role {
	opt := ctx.GetOption(name)
	if opt == nil {
		return nil
	}
	return opt.RoleValue(ctx.Session, ctx.Interaction.GuildID)
}

// Guild returns the guild where the interaction occurred
func (ctx *CommandContext) Guild() *discordgo.Guild {
	if ctx.Interaction.GuildID == "" {
		return nil
	}
	guild, _ := ctx.Session.State.Guild(ctx.Interaction.GuildID)
	return guild
}

// Channel returns the channel where the interaction occurred
func (ctx *CommandContext) Channel() *discordgo.Channel {
	channel, _ := ctx.Session.State.Channel(ctx.Interaction.ChannelID)
	return channel
}

// User returns the user who triggered the interaction
func (ctx *CommandContext) User() *discordgo.User {
	if ctx.Interaction.Member != nil {
		return ctx.Interaction.Member.User
	}
	return ctx.Interaction.User
}

// Member returns the guild member who triggered the interaction
func (ctx *CommandContext) Member() *discordgo.Member {
	return ctx.Interaction.Member
}
