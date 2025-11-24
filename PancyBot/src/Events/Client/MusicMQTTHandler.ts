import { Event } from "../../Structure/Events";
import { client } from "../../index";
import { mqttBot } from '../../Utils/mqttClient';

/**
 * Handler MQTT para controles de música desde la API/Dashboard
 * Escucha topics: music/{guildId}/play, pause, skip, skip/{index}
 */
export default new Event('ready', async (_) => {

    // Play/Resume
    mqttBot.on('music/+/play', async (payload) => {
        const topic = payload._topic; // El topic completo viene en el payload
        const guildId = topic.split('/')[1];

        const player = client.player.players.get(guildId);

        if (!player) {
            return {
                success: false,
                error: 'No hay un reproductor activo en este servidor'
            };
        }

        if (!player.isPaused) {
            return {
                success: false,
                error: 'La música ya está reproduciéndose'
            };
        }

        await player.pause(false);
        client.player.stopProgressInterval(guildId);
        client.player.startProgressInterval(player, client.player.publishMusicEvent);

        client.player.publishMusicEvent(guildId, 'resume', {
            isPlaying: true,
            isPaused: false,
            currentTrack: player.currentTrack ? {
                title: player.currentTrack.info.title,
                artist: player.currentTrack.info.author,
                duration: player.currentTrack.info.length / 1000,
                thumbnail: player.currentTrack.info.artworkUrl,
                url: player.currentTrack.info.uri
            } : null,
            progress: player.position / 1000,
            volume: player.volume,
            queue: player.queue.map((t: any) => ({
                title: t.info.title,
                artist: t.info.author,
                duration: t.info.length / 1000
            }))
        });

        return {
            success: true,
            message: 'Reproducción reanudada',
            track: player.currentTrack ? player.currentTrack.info.title : null
        };
    });

    // Pause
    mqttBot.on('music/+/pause', async (payload) => {
        const topic = payload._topic;
        const guildId = topic.split('/')[1];

        const player = client.player.players.get(guildId);

        if (!player) {
            return {
                success: false,
                error: 'No hay un reproductor activo en este servidor'
            };
        }

        if (player.isPaused) {
            return {
                success: false,
                error: 'La música ya está pausada'
            };
        }

        await player.pause(true);
        client.player.stopProgressInterval(guildId);

        client.player.publishMusicEvent(guildId, 'paused', {
            isPlaying: true,
            isPaused: true,
            currentTrack: player.currentTrack ? {
                title: player.currentTrack.info.title,
                artist: player.currentTrack.info.author,
                duration: player.currentTrack.info.length / 1000,
                thumbnail: player.currentTrack.info.artworkUrl,
                url: player.currentTrack.info.uri
            } : null,
            progress: player.position / 1000,
            volume: player.volume,
            queue: player.queue.map((t: any) => ({
                title: t.info.title,
                artist: t.info.author,
                duration: t.info.length / 1000
            }))
        });

        return {
            success: true,
            message: 'Reproducción pausada',
            track: player.currentTrack ? player.currentTrack.info.title : null
        };
    });

    // Skip (next/previous)
    mqttBot.on('music/+/skip', async (payload) => {
        const topic = payload._topic;
        const guildId = topic.split('/')[1];
        const direction = payload.direction || 'next';

        const player = client.player.players.get(guildId);

        if (!player) {
            return {
                success: false,
                error: 'No hay un reproductor activo en este servidor'
            };
        }

        if (!player.currentTrack) {
            return {
                success: false,
                error: 'No hay ninguna canción reproduciéndose'
            };
        }

        const currentTrack = player.currentTrack.info.title;

        if (direction === 'previous') {
            // Implementar lógica de canción anterior si existe
            // Por ahora, restart current track
            await player.seekTo(0);
            return {
                success: true,
                message: 'Reiniciando canción actual',
                track: currentTrack
            };
        } else {
            await player.skip();
            return {
                success: true,
                message: 'Canción saltada',
                previousTrack: currentTrack,
                nextTrack: player.currentTrack ? player.currentTrack.info.title : null
            };
        }
    });

    // Skip to index
    mqttBot.on('music/+/skip/+', async (payload) => {
        const topic = payload._topic;
        const parts = topic.split('/');
        const guildId = parts[1];
        const index = parseInt(parts[3], 10);

        const player = client.player.players.get(guildId);

        if (!player) {
            return {
                success: false,
                error: 'No hay un reproductor activo en este servidor'
            };
        }

        if (isNaN(index) || index < 0) {
            return {
                success: false,
                error: 'Índice inválido'
            };
        }

        if (index >= player.queue.length) {
            return {
                success: false,
                error: `La cola solo tiene ${player.queue.length} canciones`
            };
        }

        // Saltar a la canción específica
        // Remover todas las canciones antes de ese índice
        for (let i = 0; i < index; i++) {
            player.queue.shift();
        }

        await player.skip();

        return {
            success: true,
            message: `Saltando a la canción #${index + 1}`,
            track: player.currentTrack ? player.currentTrack.info.title : null
        };
    });

    console.success('Handlers MQTT de música registrados', 'MQTT');
});

