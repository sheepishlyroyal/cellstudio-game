//  ==============================================================
//   DNA: CODE OF LIFE  —  v2 FULL REWRITE
//   Educational biology adventure for Microsoft MakeCode Arcade
//   https://arcade.makecode.com/
// 
//   HOW TO IMPORT:
//     1. Open https://arcade.makecode.com/ and click "New Project"
//     2. Top-right, switch language from Blocks to PYTHON
//     3. Paste this ENTIRE file
//     4. Press the green play button
// 
//   LEVELS (harder, meaner, more fun):
//     L1 - DNA BUILDING      Drag & drop nucleotides into the template
//                            strand with a cursor. Hydrogen bonds snap
//                            closed on correct pairs (2 for A-T, 3 for
//                            C-G). Mutations damage the cell; 3 triggers
//                            "DNA DAMAGE DETECTED" and the strand
//                            collapses. 60s timer before degradation.
// 
//     L2 - TRANSCRIPTION     A fast-moving RNA polymerase droplet
//                            oscillates above the DNA, accelerating
//                            with every attempt. Drop it onto the
//                            glowing TATA promoter with A. Miss too
//                            many times and transcription shuts down.
//                            On success: strands split, mRNA auto-builds.
// 
//     L3 - mRNA MAZE         Real tile maze. Collect energy orbs,
//                            dodge chasing RNase enzymes, touch SAFE
//                            ZONES to stabilize (buys time), reach the
//                            ribosome with enough energy. Timer ticks
//                            down; three hits = mRNA degraded.
// 
//   GLOBAL:
//     One shared Cell Health bar (info.set_life). Every mistake in
//     every level hits the same bar. Zero = game over.
//  ==============================================================
//  ==============================================================
//   1. COLOR / LETTER MAPPING
//  ==============================================================
//  MakeCode Arcade palette indices
let A_COLOR = 2
//  red      - adenine
let T_COLOR = 9
//  blue     - thymine
let C_COLOR = 7
//  green    - cytosine
let G_COLOR = 5
//  yellow   - guanine
let U_COLOR = 11
//  purple   - uracil
let INK_COLOR = 1
//  white
let DARK_BG = 15
//  black
let GLOW = 9
//  light blue accent
//  ==============================================================
//   2. PIXEL ART — NUCLEOTIDES & GAME PIECES
//  ==============================================================
//  Larger 10x10 nucleotides for better readability
function nuc_img(letter: string): Image {
    if (letter == "A") {
        return img`
            . . 2 2 2 2 2 2 . .
            . 2 2 2 2 2 2 2 2 .
            2 2 1 1 2 2 1 1 2 2
            2 2 1 1 2 2 1 1 2 2
            2 2 2 2 2 2 2 2 2 2
            2 2 1 1 1 1 1 1 2 2
            2 2 1 1 1 1 1 1 2 2
            2 2 2 2 2 2 2 2 2 2
            . 2 2 2 2 2 2 2 2 .
            . . 2 2 2 2 2 2 . .
        `
    }
    
    if (letter == "T") {
        return img`
            . . 9 9 9 9 9 9 . .
            . 9 9 9 9 9 9 9 9 .
            9 9 1 1 9 9 1 1 9 9
            9 9 1 1 9 9 1 1 9 9
            9 9 9 9 9 9 9 9 9 9
            9 9 1 1 1 1 1 1 9 9
            9 9 1 1 1 1 1 1 9 9
            9 9 9 9 9 9 9 9 9 9
            . 9 9 9 9 9 9 9 9 .
            . . 9 9 9 9 9 9 . .
        `
    }
    
    if (letter == "C") {
        return img`
            . . 7 7 7 7 7 7 . .
            . 7 7 7 7 7 7 7 7 .
            7 7 1 1 7 7 1 1 7 7
            7 7 1 1 7 7 1 1 7 7
            7 7 7 7 7 7 7 7 7 7
            7 7 1 1 1 1 1 1 7 7
            7 7 1 1 1 1 1 1 7 7
            7 7 7 7 7 7 7 7 7 7
            . 7 7 7 7 7 7 7 7 .
            . . 7 7 7 7 7 7 . .
        `
    }
    
    if (letter == "G") {
        return img`
            . . 5 5 5 5 5 5 . .
            . 5 5 5 5 5 5 5 5 .
            5 5 1 1 5 5 1 1 5 5
            5 5 1 1 5 5 1 1 5 5
            5 5 5 5 5 5 5 5 5 5
            5 5 1 1 1 1 1 1 5 5
            5 5 1 1 1 1 1 1 5 5
            5 5 5 5 5 5 5 5 5 5
            . 5 5 5 5 5 5 5 5 .
            . . 5 5 5 5 5 5 . .
        `
    }
    
    //  U (RNA)
    return img`
        . . 11 11 11 11 11 11 . .
        . 11 11 11 11 11 11 11 11 .
        11 11 1 1 11 11 1 1 11 11
        11 11 1 1 11 11 1 1 11 11
        11 11 11 11 11 11 11 11 11 11
        11 11 1 1 1 1 1 1 11 11
        11 11 1 1 1 1 1 1 11 11
        11 11 11 11 11 11 11 11 11 11
        . 11 11 11 11 11 11 11 11 .
        . . 11 11 11 11 11 11 . .
    `
}

//  Slot outline (empty slot in template strand)
function slot_empty_img(): Image {
    return img`
        1 1 1 1 1 1 1 1 1 1
        1 . . . . . . . . 1
        1 . . . . . . . . 1
        1 . . . . . . . . 1
        1 . . . . . . . . 1
        1 . . . . . . . . 1
        1 . . . . . . . . 1
        1 . . . . . . . . 1
        1 . . . . . . . . 1
        1 1 1 1 1 1 1 1 1 1
    `
}

//  Target letter dimmed outline (shows what letter is expected)
function slot_target_img(letter: string): Image {
    if (letter == "A") {
        return img`
            1 1 1 1 1 1 1 1 1 1
            1 . 2 2 2 2 2 2 . 1
            1 2 . . . . . . 2 1
            1 2 . . 2 2 . . 2 1
            1 2 . . . . . . 2 1
            1 2 . 2 2 2 2 . 2 1
            1 2 . . . . . . 2 1
            1 2 . . . . . . 2 1
            1 . 2 2 2 2 2 2 . 1
            1 1 1 1 1 1 1 1 1 1
        `
    }
    
    if (letter == "T") {
        return img`
            1 1 1 1 1 1 1 1 1 1
            1 . 9 9 9 9 9 9 . 1
            1 9 . . . . . . 9 1
            1 9 . . 9 9 . . 9 1
            1 9 . . . . . . 9 1
            1 9 . 9 9 9 9 . 9 1
            1 9 . . . . . . 9 1
            1 9 . . . . . . 9 1
            1 . 9 9 9 9 9 9 . 1
            1 1 1 1 1 1 1 1 1 1
        `
    }
    
    if (letter == "C") {
        return img`
            1 1 1 1 1 1 1 1 1 1
            1 . 7 7 7 7 7 7 . 1
            1 7 . . . . . . 7 1
            1 7 . . 7 7 . . 7 1
            1 7 . . . . . . 7 1
            1 7 . 7 7 7 7 . 7 1
            1 7 . . . . . . 7 1
            1 7 . . . . . . 7 1
            1 . 7 7 7 7 7 7 . 1
            1 1 1 1 1 1 1 1 1 1
        `
    }
    
    //  G
    return img`
        1 1 1 1 1 1 1 1 1 1
        1 . 5 5 5 5 5 5 . 1
        1 5 . . . . . . 5 1
        1 5 . . 5 5 . . 5 1
        1 5 . . . . . . 5 1
        1 5 . 5 5 5 5 . 5 1
        1 5 . . . . . . 5 1
        1 5 . . . . . . 5 1
        1 . 5 5 5 5 5 5 . 1
        1 1 1 1 1 1 1 1 1 1
    `
}

//  Player cursor / hand
function cursor_img(): Image {
    return img`
        . . 1 1 1 1 . . .
        . 1 . . . . 1 . .
        1 . . . . . . 1 .
        1 . . 9 9 . . 1 .
        1 . . 9 9 . . 1 .
        1 . . . . . . 1 .
        . 1 . . . . 1 . .
        . . 1 1 1 1 . . .
        . . . 1 1 . . . .
    `
}

//  Yellow "YOU" label that floats above the player sprite
function you_label_img(): Image {
    //  15x7 pixel-art "YOU" in color 5 (yellow) with black outline
    return img`
        5 . 5 . 5 5 5 . 5 5 5
        5 . 5 . 5 . 5 . 5 . 5
        5 . 5 . 5 . 5 . 5 . 5
        . 5 . . 5 . 5 . 5 . 5
        . 5 . . 5 . 5 . 5 . 5
        . 5 . . 5 . 5 . 5 . 5
        . 5 . . 5 5 5 . 5 5 5
    `
}

//  Hydrogen bond (small dots)
function bond_dot_img(): Image {
    return img`
        1 1
        1 1
    `
}

//  H-bond line between paired bases
function bond_line_img(): Image {
    return img`
        1 1 1 1 1 1 1 1 1 1 1 1
    `
}

//  RNA polymerase droplet (moving object in Level 2)
function droplet_img(): Image {
    return img`
        . . . 11 11 . . .
        . . 11 11 11 11 . .
        . 11 11 1 1 11 11 .
        11 11 1 1 1 1 11 11
        11 11 1 11 11 1 11 11
        11 11 11 11 11 11 11 11
        . 11 11 11 11 11 11 .
        . . 11 11 11 11 . .
        . . . 11 11 . . .
    `
}

//  DNA strand piece (for Level 2 background)
function strand_piece_top(): Image {
    return img`
        8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8
        8 1 1 1 1 1 1 1 1 1 1 1 1 1 1 8
        8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8
    `
}

function strand_piece_bot(): Image {
    return img`
        2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2
        2 1 1 1 1 1 1 1 1 1 1 1 1 1 1 2
        2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2
    `
}

//  TATA promoter box (glowing zone)
function tata_img(): Image {
    return img`
        5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5
        5 1 1 1 5 5 1 5 1 1 1 5 5 5 1 5 5 5 5 5
        5 1 5 5 5 5 1 5 5 1 5 5 5 1 5 1 5 5 5 5
        5 1 1 1 5 5 1 5 5 1 5 5 5 1 5 1 5 5 5 5
        5 1 5 5 5 5 1 5 5 1 5 5 5 1 1 1 5 5 5 5
        5 1 5 5 5 5 1 5 5 1 5 5 5 1 5 1 5 5 5 5
        5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5
    `
}

//  Aim arrow (shown when trying to drop droplet)
function aim_line_img(): Image {
    return img`
        1
        1
        1
        1
        1
        1
    `
}

//  mRNA player (Level 3)
function mrna_player_img(): Image {
    return img`
        . 11 11 11 11 11 11 .
        11 1 11 11 11 11 1 11
        11 11 1 11 11 1 11 11
        11 11 11 1 1 11 11 11
        11 11 11 1 1 11 11 11
        11 11 1 11 11 1 11 11
        11 1 11 11 11 11 1 11
        . 11 11 11 11 11 11 .
    `
}

//  RNase enzyme (Level 3 enemy)
function rnase_img(): Image {
    return img`
        . 2 2 2 2 2 2 .
        2 1 . 2 2 . 1 2
        2 . 2 2 2 2 . 2
        2 2 2 1 1 2 2 2
        2 2 2 1 1 2 2 2
        2 . 2 2 2 2 . 2
        2 1 . 2 2 . 1 2
        . 2 2 2 2 2 2 .
    `
}

//  ATP energy orb
function atp_img(): Image {
    return img`
        . . 4 4 4 . .
        . 4 5 5 5 4 .
        4 5 5 1 5 5 4
        4 5 1 1 1 5 4
        4 5 5 1 5 5 4
        . 4 5 5 5 4 .
        . . 4 4 4 . .
    `
}

//  Ribosome (goal)
function ribosome_img(): Image {
    return img`
        . 6 6 6 6 6 6 6 6 6 .
        6 6 7 7 6 6 6 7 7 6 6
        6 7 7 7 7 6 7 7 7 7 6
        6 7 7 1 7 7 7 7 1 7 6
        6 7 7 7 7 7 7 7 7 7 6
        6 6 7 7 7 7 7 7 7 6 6
        . 6 6 7 7 7 7 7 6 6 .
        . . 6 6 7 7 7 6 6 . .
        . . . 6 6 6 6 6 . . .
    `
}

//  Wall tile (maze)
function wall_img(): Image {
    return img`
        10 10 10 10 10 10 10 10 10 10 10 10 10 10 10 10
        10 11 11 11 11 11 11 11 11 11 11 11 11 11 11 10
        10 11 10 10 11 11 10 10 11 11 10 10 11 11 11 10
        10 11 11 11 11 11 11 11 11 11 11 11 11 11 11 10
        10 11 11 11 11 10 10 11 11 11 10 10 11 11 11 10
        10 10 10 11 11 10 10 11 11 11 10 10 11 11 11 10
        10 11 11 11 11 11 11 11 11 11 11 11 11 11 11 10
        10 11 11 10 10 11 11 10 10 11 11 10 10 11 11 10
        10 11 11 10 10 11 11 10 10 11 11 10 10 11 11 10
        10 11 11 11 11 11 11 11 11 11 11 11 11 11 11 10
        10 11 10 10 11 11 10 10 11 11 10 10 11 11 11 10
        10 11 11 11 11 11 11 11 11 11 11 11 11 11 11 10
        10 11 11 11 11 10 10 11 11 11 10 10 11 11 11 10
        10 10 10 11 11 10 10 11 11 11 10 10 11 11 11 10
        10 11 11 11 11 11 11 11 11 11 11 11 11 11 11 10
        10 10 10 10 10 10 10 10 10 10 10 10 10 10 10 10
    `
}

//  Safe zone (Level 3 - heals mRNA / pauses timer)
function safe_zone_img(): Image {
    return img`
        6 6 6 6 6 6 6 6
        6 1 6 6 6 6 1 6
        6 6 1 6 6 1 6 6
        6 6 6 1 1 6 6 6
        6 6 6 1 1 6 6 6
        6 6 1 6 6 1 6 6
        6 1 6 6 6 6 1 6
        6 6 6 6 6 6 6 6
    `
}

//  ==============================================================
//   3. GLOBAL STATE
//  ==============================================================
let current_level = 0
let cell_health = 100
let score = 0
let game_running = false
//  Custom sprite kinds
let WALL_KIND = SpriteKind.create()
let UI_KIND = SpriteKind.create()
let HELD_KIND = SpriteKind.create()
let SLOT_KIND = SpriteKind.create()
let BOND_KIND = SpriteKind.create()
let DROPLET_KIND = SpriteKind.create()
let TATA_KIND = SpriteKind.create()
let STRAND_KIND = SpriteKind.create()
let SAFE_KIND = SpriteKind.create()
let YOU_LABEL_KIND = SpriteKind.create()
//  Global "YOU" label sprite that follows the current player sprite
let you_label : Sprite = null
//  ==============================================================
//   4. SOUND EFFECTS (non-blocking — never stalls the game)
//  ==============================================================
function sfx_correct() {
    music.play(music.tonePlayable(523, music.beat(BeatFraction.Eighth)), music.PlaybackMode.InBackground)
    music.play(music.tonePlayable(784, music.beat(BeatFraction.Eighth)), music.PlaybackMode.InBackground)
}

function sfx_wrong() {
    music.play(music.tonePlayable(196, music.beat(BeatFraction.Quarter)), music.PlaybackMode.InBackground)
    music.play(music.tonePlayable(147, music.beat(BeatFraction.Quarter)), music.PlaybackMode.InBackground)
}

function sfx_bond() {
    music.play(music.tonePlayable(880, music.beat(BeatFraction.Eighth)), music.PlaybackMode.InBackground)
}

function sfx_pickup() {
    music.play(music.tonePlayable(659, music.beat(BeatFraction.Sixteenth)), music.PlaybackMode.InBackground)
}

function sfx_drop() {
    music.play(music.tonePlayable(392, music.beat(BeatFraction.Sixteenth)), music.PlaybackMode.InBackground)
}

function sfx_energy() {
    music.play(music.tonePlayable(1046, music.beat(BeatFraction.Eighth)), music.PlaybackMode.InBackground)
}

function sfx_damage() {
    music.play(music.tonePlayable(110, music.beat(BeatFraction.Half)), music.PlaybackMode.InBackground)
}

function sfx_glitch() {
    music.play(music.tonePlayable(70, music.beat(BeatFraction.Sixteenth)), music.PlaybackMode.InBackground)
    music.play(music.tonePlayable(140, music.beat(BeatFraction.Sixteenth)), music.PlaybackMode.InBackground)
}

function sfx_level_up() {
    control.runInParallel(function _melody_level_up() {
        music.playMelody("C5 E5 G5 C6", 180)
    })
}

function sfx_win() {
    control.runInParallel(function _melody_win() {
        music.playMelody("C E G C5 E5 G5 C6 E6 G6", 150)
    })
}

function sfx_death() {
    control.runInParallel(function _melody_death() {
        music.playMelody("C5 B A G F E D C C3", 180)
    })
}

//  ==============================================================
//   5. HUD & HEALTH HELPERS
//  ==============================================================
function update_hud() {
    info.setLife(Math.max(1, Math.idiv(cell_health, 10)))
    info.setScore(score)
}

function take_damage(amount: number) {
    
    cell_health = cell_health - amount
    if (cell_health < 0) {
        cell_health = 0
    }
    
    update_hud()
    scene.cameraShake(4, 300)
    if (cell_health <= 0) {
        lose_game("CELL FLATLINED")
    }
    
}

function heal(amount: number) {
    
    cell_health = cell_health + amount
    if (cell_health > 100) {
        cell_health = 100
    }
    
    update_hud()
}

function add_score(amount: number) {
    
    score = score + amount
    update_hud()
}

function clear_gameplay_sprites() {
    
    sprites.destroyAllSpritesOfKind(SpriteKind.Player)
    sprites.destroyAllSpritesOfKind(SpriteKind.Food)
    sprites.destroyAllSpritesOfKind(SpriteKind.Enemy)
    sprites.destroyAllSpritesOfKind(SpriteKind.Projectile)
    sprites.destroyAllSpritesOfKind(WALL_KIND)
    sprites.destroyAllSpritesOfKind(HELD_KIND)
    sprites.destroyAllSpritesOfKind(SLOT_KIND)
    sprites.destroyAllSpritesOfKind(BOND_KIND)
    sprites.destroyAllSpritesOfKind(DROPLET_KIND)
    sprites.destroyAllSpritesOfKind(TATA_KIND)
    sprites.destroyAllSpritesOfKind(STRAND_KIND)
    sprites.destroyAllSpritesOfKind(SAFE_KIND)
    sprites.destroyAllSpritesOfKind(YOU_LABEL_KIND)
    you_label = null
}

//  Create/position a yellow "YOU" label above the given player sprite.
//  Call once after the player sprite exists, then reposition it every
//  frame from the per-level on_update.
function spawn_you_label() {
    
    if (you_label !== null) {
        you_label.destroy()
    }
    
    you_label = sprites.create(you_label_img(), YOU_LABEL_KIND)
    you_label.setFlag(SpriteFlag.Ghost, true)
    you_label.z = 100
}

function position_you_label(target: Sprite) {
    if (you_label === null || target === null) {
        return
    }
    
    you_label.setPosition(target.x, target.y - 10)
}

//  ==============================================================
//   6. SCREEN EFFECTS (glitch, damage flash, level splash)
//  ==============================================================
function glitch_screen() {
    scene.cameraShake(6, 400)
    effects.dissolve.startScreenEffect(180)
    sfx_glitch()
}

//  ==============================================================
//   7. LEVEL 1 — DNA BUILDING (drag & drop nucleotides)
//  ==============================================================
//  10 template slots at top. Nucleotide palette (A T C G) at bottom.
//  Cursor moves freely with joystick. Press A near a palette tile to
//  pick up; press A near a slot to drop. Correct placement triggers
//  hydrogen-bond animation. Wrong = mutation. 3 mutations = collapse.
//  Timer: 60s before strand degrades.
let LEVEL1_SLOTS = 10
let LEVEL1_MUTATION_LIMIT = 3
let LEVEL1_TIME = 60
let level1_template = ["T", "A", "C", "G", "A", "T", "G", "C", "T", "A"]
let level1_targets = ["A", "T", "G", "C", "T", "A", "C", "G", "A", "T"]
let level1_filled = [false, false, false, false, false, false, false, false, false, false]
let level1_mutations = 0
let level1_correct = 0
let level1_held = ""
let level1_cursor : Sprite = null
let level1_held_sprite : Sprite = null
let level1_palette_sprites : Sprite[] = []
let level1_slot_sprites : Sprite[] = []
let level1_template_sprites : Sprite[] = []
let level1_timer_sprite : Sprite = null
//  Slot geometry — 10 slots across top, 12px wide with 2px gaps
let LEVEL1_SLOT_Y = 22
let LEVEL1_SLOT_START_X = 14
let LEVEL1_SLOT_STRIDE = 14
let LEVEL1_TEMPLATE_Y = 8
//  Palette geometry — 4 nucleotides at bottom
let LEVEL1_PALETTE_Y = 104
let LEVEL1_PALETTE_XS = [30, 60, 90, 120]
let LEVEL1_PALETTE_LETTERS = ["A", "T", "C", "G"]
function level1_slot_x(idx: number): number {
    return LEVEL1_SLOT_START_X + idx * LEVEL1_SLOT_STRIDE
}

function start_level1() {
    let i: number;
    let s: Sprite;
    
    
    
    
    
    current_level = 1
    game_running = true
    clear_gameplay_sprites()
    scene.setBackgroundColor(15)
    level1_mutations = 0
    level1_correct = 0
    level1_held = ""
    level1_held_sprite = null
    level1_filled = [false, false, false, false, false, false, false, false, false, false]
    game.splash("LEVEL 1", "DNA BUILDING")
    game.splash("Match bases:", "A-T  and  C-G")
    game.splash("Pick with A", "Drop with A in slot")
    game.splash("3 mutations =", "DNA COLLAPSE!")
    //  Template strand at top (shows what each slot needs to pair with)
    level1_template_sprites = []
    for (i = 0; i < LEVEL1_SLOTS; i++) {
        s = sprites.create(nuc_img(level1_template[i]), SLOT_KIND)
        s.setPosition(level1_slot_x(i), LEVEL1_TEMPLATE_Y)
        level1_template_sprites.push(s)
    }
    //  Empty slots just below (where player places complements)
    level1_slot_sprites = []
    for (i = 0; i < LEVEL1_SLOTS; i++) {
        s = sprites.create(slot_target_img(level1_targets[i]), SLOT_KIND)
        s.setPosition(level1_slot_x(i), LEVEL1_SLOT_Y)
        level1_slot_sprites.push(s)
    }
    //  Palette at bottom
    level1_palette_sprites = []
    for (i = 0; i < 4; i++) {
        s = sprites.create(nuc_img(LEVEL1_PALETTE_LETTERS[i]), SLOT_KIND)
        s.setPosition(LEVEL1_PALETTE_XS[i], LEVEL1_PALETTE_Y)
        level1_palette_sprites.push(s)
    }
    //  Cursor (player) — start near the palette so the user sees the
    //  affordance immediately. Faster move speed + STAY_IN_SCREEN.
    level1_cursor = sprites.create(cursor_img(), SpriteKind.Player)
    level1_cursor.setPosition(30, 90)
    controller.moveSprite(level1_cursor, 140, 140)
    level1_cursor.setFlag(SpriteFlag.StayInScreen, true)
    spawn_you_label()
    game.splash("Move with D-pad", "A = pick / place")
    game.splash("Start at PALETTE", "Go UP to slot")
    //  Start countdown
    info.startCountdown(LEVEL1_TIME)
    info.onCountdownEnd(function on_level1_time_out() {
        if (current_level == 1 && game_running) {
            game.splash("DEGRADATION!", "Strand dissolved.")
            lose_game("TIME RAN OUT")
        }
        
    })
    update_hud()
    sfx_level_up()
}

function level1_nearest_palette_index(): number {
    let d: number;
    //  Return palette idx if cursor is near a palette nucleotide, else -1.
    //  Generous thresholds so the user can easily grab a base.
    if (level1_cursor === null) {
        return -1
    }
    
    let cy = level1_cursor.y
    if (Math.abs(cy - LEVEL1_PALETTE_Y) > 20) {
        return -1
    }
    
    let best = -1
    let best_d = 9999
    for (let i = 0; i < 4; i++) {
        d = Math.abs(level1_cursor.x - LEVEL1_PALETTE_XS[i])
        if (d < 16 && d < best_d) {
            best = i
            best_d = d
        }
        
    }
    return best
}

function level1_nearest_slot_index(): number {
    let d: number;
    //  Return slot idx if cursor is over a slot, else -1.
    //  Pick the slot closest to the cursor x, not just one within range.
    if (level1_cursor === null) {
        return -1
    }
    
    let cy = level1_cursor.y
    if (Math.abs(cy - LEVEL1_SLOT_Y) > 20) {
        return -1
    }
    
    let best = -1
    let best_d = 9999
    for (let i = 0; i < LEVEL1_SLOTS; i++) {
        d = Math.abs(level1_cursor.x - level1_slot_x(i))
        if (d < 12 && d < best_d) {
            best = i
            best_d = d
        }
        
    }
    return best
}

function level1_pick_up(letter: string) {
    
    level1_held = letter
    if (level1_held_sprite !== null) {
        level1_held_sprite.destroy()
    }
    
    level1_held_sprite = sprites.create(nuc_img(letter), HELD_KIND)
    sfx_pickup()
}

function level1_drop_held() {
    
    level1_held = ""
    if (level1_held_sprite !== null) {
        level1_held_sprite.destroy()
    }
    
    level1_held_sprite = null
}

function level1_attempt_place(slot_idx: number) {
    let placed: Sprite;
    let nbonds: number;
    let bd: Sprite;
    
    if (level1_filled[slot_idx]) {
        return
    }
    
    let target = level1_targets[slot_idx]
    if (level1_held == target) {
        //  correct placement!
        placed = sprites.create(nuc_img(level1_held), SLOT_KIND)
        placed.setPosition(level1_slot_x(slot_idx), LEVEL1_SLOT_Y)
        level1_filled[slot_idx] = true
        level1_correct = level1_correct + 1
        add_score(15)
        sfx_correct()
        //  Hydrogen bonds: 2 for A-T, 3 for C-G
        nbonds = 2
        if (target == "C" || target == "G") {
            nbonds = 3
        }
        
        for (let b = 0; b < nbonds; b++) {
            bd = sprites.create(bond_dot_img(), BOND_KIND)
            bd.setPosition(level1_slot_x(slot_idx) - 2 + b * 2, Math.idiv(LEVEL1_TEMPLATE_Y + LEVEL1_SLOT_Y, 2))
            bd.lifespan = 9999
        }
        sfx_bond()
        level1_drop_held()
        //  win check
        if (level1_correct >= LEVEL1_SLOTS) {
            info.stopCountdown()
            level1_win()
        }
        
    } else {
        //  wrong placement!
        level1_mutations = level1_mutations + 1
        take_damage(10)
        sfx_wrong()
        glitch_screen()
        //  visual: shake the camera to emphasize the error
        scene.cameraShake(4, 220)
        game.splash("MUTATION!", "Wrong base.")
        if (level1_mutations >= LEVEL1_MUTATION_LIMIT) {
            info.stopCountdown()
            game.splash("DNA DAMAGE", "DETECTED!")
            game.splash("Strand collapsed!", "")
            lose_game("TOO MANY MUTATIONS")
        } else {
            level1_drop_held()
        }
        
    }
    
}

function level1_on_a() {
    let pi: number;
    let si: number;
    //  Priority: if holding -> try drop in slot. If empty -> try pickup.
    if (level1_held == "") {
        pi = level1_nearest_palette_index()
        if (pi >= 0) {
            level1_pick_up(LEVEL1_PALETTE_LETTERS[pi])
        }
        
    } else {
        si = level1_nearest_slot_index()
        if (si >= 0) {
            level1_attempt_place(si)
        }
        
    }
    
}

function level1_on_b() {
    //  B: drop current held back
    if (level1_held != "") {
        level1_drop_held()
        sfx_drop()
    }
    
}

function level1_on_update() {
    if (current_level != 1 || !game_running) {
        return
    }
    
    if (level1_held_sprite !== null && level1_cursor !== null) {
        level1_held_sprite.setPosition(level1_cursor.x, level1_cursor.y - 10)
    }
    
    position_you_label(level1_cursor)
}

function level1_win() {
    game.splash("LEVEL 1", "CLEAR!")
    game.splash("All 10 bases", "paired.")
    add_score(100)
    heal(15)
    effects.confetti.startScreenEffect(1200)
    sfx_level_up()
    control.waitMicros(100000)
    //  ---- Educational debrief: DNA base pairing ----
    game.splash("WHAT JUST HAPPENED?", "DNA Base Pairing")
    game.splash("DNA stores info in", "A-T and C-G pairs.")
    game.splash("A bonds with T", "via 2 H-bonds.")
    game.splash("C bonds with G", "via 3 H-bonds.")
    game.splash("That is why C-G", "regions are stronger.")
    game.splash("Each human cell has", "~3 billion base pairs.")
    game.splash("Stretched out:", "2 meters of DNA!")
    game.splash("REAL-WORLD USE #1:", "DNA Forensics")
    game.splash("Crime labs match", "DNA at crime scenes")
    game.splash("using the same", "pairing rules.")
    game.splash("REAL-WORLD USE #2:", "Ancestry Testing")
    game.splash("23andMe reads your", "base-pair sequence")
    game.splash("to trace your", "genetic heritage.")
    game.splash("REAL-WORLD USE #3:", "CRISPR gene editing")
    game.splash("Scientists re-pair", "bases to cure")
    game.splash("sickle cell, cancer,", "blindness, and more.")
    game.splash("FUN FACT:", "DNA is so dense,")
    game.splash("1 gram could store", "215 petabytes of data.")
    game.splash("NEXT UP...", "TRANSCRIPTION!")
    start_level2()
}

//  ==============================================================
//   8. LEVEL 2 — TRANSCRIPTION (drop droplet on TATA)
//  ==============================================================
//  A fast-moving purple polymerase droplet bounces left-right above
//  the DNA strand. Press A to drop it. If it lands on the glowing
//  TATA zone, transcription initiates: strands separate visually
//  and mRNA auto-builds. Misses speed up the droplet and cost
//  attempts. 3 successful drops = level complete. 3 misses = fail.
let LEVEL2_SUCCESSES_NEEDED = 3
let LEVEL2_MAX_MISSES = 3
let LEVEL2_TIME = 45
let level2_droplet : Sprite = null
let level2_droplet_x = 10
let level2_droplet_dir = 1
let level2_droplet_speed = 2.2
//  pixels per frame
let level2_successes = 0
let level2_misses = 0
let level2_can_drop = true
let level2_strand_top : Sprite = null
let level2_strand_bot : Sprite = null
let level2_tata : Sprite = null
let level2_tata_x = 80
let level2_tata_width = 22
let level2_mrna_sprites : Sprite[] = []
let LEVEL2_DROPLET_Y = 28
let LEVEL2_STRAND_Y = 64
function start_level2() {
    
    
    
    
    
    current_level = 2
    game_running = true
    clear_gameplay_sprites()
    scene.setBackgroundColor(11)
    //  deep purple
    level2_droplet_x = 10.0
    level2_droplet_dir = 1
    level2_droplet_speed = 2.2
    level2_successes = 0
    level2_misses = 0
    level2_can_drop = true
    level2_mrna_sprites = []
    game.splash("LEVEL 2", "TRANSCRIPTION")
    game.splash("Drop polymerase", "onto TATA box!")
    game.splash("A = DROP", "3 hits = WIN")
    game.splash("3 misses = FAIL", "Speed rises!")
    //  DNA strand — top half (blue) and bottom half (red)
    level2_strand_top = sprites.create(strand_piece_top(), STRAND_KIND)
    level2_strand_top.setPosition(80, LEVEL2_STRAND_Y - 3)
    level2_strand_bot = sprites.create(strand_piece_bot(), STRAND_KIND)
    level2_strand_bot.setPosition(80, LEVEL2_STRAND_Y + 3)
    //  TATA promoter box — randomize location between attempts
    level2_tata_x = randint(50, 110)
    level2_tata = sprites.create(tata_img(), TATA_KIND)
    level2_tata.setPosition(level2_tata_x, LEVEL2_STRAND_Y - 16)
    //  Droplet
    level2_droplet = sprites.create(droplet_img(), DROPLET_KIND)
    level2_droplet.setPosition(Math.trunc(level2_droplet_x), LEVEL2_DROPLET_Y)
    spawn_you_label()
    info.startCountdown(LEVEL2_TIME)
    info.onCountdownEnd(function on_level2_time_out() {
        if (current_level == 2 && game_running) {
            game.splash("TRANSCRIPTION", "TIMED OUT!")
            lose_game("TRANSCRIPTION FAIL")
        }
        
    })
    update_hud()
    sfx_level_up()
}

function level2_on_update() {
    
    if (current_level != 2 || !game_running) {
        return
    }
    
    if (level2_droplet === null) {
        return
    }
    
    if (!level2_can_drop) {
        return
    }
    
    //  Oscillate droplet horizontally, bounce at walls
    level2_droplet_x = level2_droplet_x + level2_droplet_dir * level2_droplet_speed
    if (level2_droplet_x > 150) {
        level2_droplet_x = 150
        level2_droplet_dir = -1
    }
    
    if (level2_droplet_x < 10) {
        level2_droplet_x = 10
        level2_droplet_dir = 1
    }
    
    level2_droplet.setPosition(Math.trunc(level2_droplet_x), LEVEL2_DROPLET_Y)
    position_you_label(level2_droplet)
}

function level2_on_a() {
    
    
    if (current_level != 2 || !game_running) {
        return
    }
    
    if (!level2_can_drop || level2_droplet === null) {
        return
    }
    
    level2_can_drop = false
    //  Drop the droplet straight down and check
    let drop_x = Math.trunc(level2_droplet_x)
    //  Animate falling
    level2_droplet.setVelocity(0, 160)
    //  Wait for it to arrive at strand
    _level2_resolve_drop(drop_x)
}

function _level2_resolve_drop(drop_x: number) {
    
    //  Check if over TATA
    let hit = Math.abs(drop_x - level2_tata_x) <= Math.idiv(level2_tata_width, 2)
    if (hit) {
        sfx_correct()
        add_score(30)
        level2_successes = level2_successes + 1
        _level2_split_strands(drop_x)
        _level2_build_mrna_animated(drop_x)
        game.splash("PROMOTER HIT!", "Strands split.")
        if (level2_successes >= LEVEL2_SUCCESSES_NEEDED) {
            info.stopCountdown()
            level2_win()
            return
        }
        
    } else {
        sfx_wrong()
        take_damage(12)
        level2_misses = level2_misses + 1
        game.splash("MISSED!", "Wrong zone.")
        glitch_screen()
        if (level2_misses >= LEVEL2_MAX_MISSES) {
            info.stopCountdown()
            game.splash("TRANSCRIPTION", "SHUTDOWN!")
            lose_game("TOO MANY MISSES")
            return
        }
        
    }
    
    //  Reset droplet for next attempt; speed ramps up
    _level2_reset_droplet()
}

function _level2_split_strands(drop_x: number) {
    //  Quick animation: top strand jumps up, bot stays
    if (level2_strand_top !== null) {
        level2_strand_top.setVelocity(0, -20)
        level2_strand_top.startEffect(effects.bubbles, 300)
    }
    
    if (level2_strand_bot !== null) {
        level2_strand_bot.setVelocity(0, 10)
    }
    
    control.waitMicros(250000)
    if (level2_strand_top !== null) {
        level2_strand_top.setVelocity(0, 0)
    }
    
    if (level2_strand_bot !== null) {
        level2_strand_bot.setVelocity(0, 0)
    }
    
}

function _level2_build_mrna_animated(start_x: number) {
    let u: Sprite;
    //  Spawn a little row of U nucleotides building from start_x rightward
    let count = 5
    for (let i = 0; i < count; i++) {
        u = sprites.create(nuc_img("U"), SLOT_KIND)
        u.setPosition(start_x + (i + 1) * 6, LEVEL2_STRAND_Y + 12)
        u.startEffect(effects.coolRadial, 200)
        level2_mrna_sprites.push(u)
        sfx_bond()
        control.waitMicros(60000)
    }
}

function _level2_reset_droplet() {
    
    
    control.waitMicros(400000)
    if (level2_droplet === null) {
        return
    }
    
    level2_droplet.setVelocity(0, 0)
    level2_droplet_x = 10.0
    level2_droplet_dir = 1
    level2_droplet_speed = level2_droplet_speed + 0.6
    //  SPEED RAMP!
    level2_droplet.setPosition(Math.trunc(level2_droplet_x), LEVEL2_DROPLET_Y)
    //  Reposition TATA for next attempt
    level2_tata_x = randint(40, 120)
    if (level2_tata !== null) {
        level2_tata.setPosition(level2_tata_x, LEVEL2_STRAND_Y - 16)
    }
    
    //  restore split strands
    if (level2_strand_top !== null) {
        level2_strand_top.setPosition(80, LEVEL2_STRAND_Y - 3)
    }
    
    if (level2_strand_bot !== null) {
        level2_strand_bot.setPosition(80, LEVEL2_STRAND_Y + 3)
    }
    
    level2_can_drop = true
}

function level2_win() {
    game.splash("LEVEL 2", "CLEAR!")
    game.splash("mRNA ready", "for export.")
    add_score(150)
    heal(20)
    effects.confetti.startScreenEffect(1200)
    sfx_level_up()
    control.waitMicros(100000)
    //  ---- Educational debrief: Transcription ----
    game.splash("WHAT JUST HAPPENED?", "Transcription")
    game.splash("RNA polymerase", "read your DNA")
    game.splash("and copied it into", "messenger RNA.")
    game.splash("TATA box = the", "promoter landing pad.")
    game.splash("Without TATA,", "no transcription!")
    game.splash("RNA uses URACIL (U)", "instead of T.")
    game.splash("SPEED FACT:", "Polymerase reads")
    game.splash("about 40 bases", "per SECOND.")
    game.splash("REAL-WORLD USE #1:", "mRNA Vaccines")
    game.splash("COVID vaccines from", "Pfizer and Moderna")
    game.splash("are lab-made mRNA", "that trains your cells.")
    game.splash("REAL-WORLD USE #2:", "Cancer Research")
    game.splash("Tumors often hijack", "transcription.")
    game.splash("Drugs that block RNA", "polymerase stop tumors.")
    game.splash("REAL-WORLD USE #3:", "Antibiotics")
    game.splash("Rifampin kills TB", "by jamming bacterial")
    game.splash("RNA polymerase.", "Your human one is safe!")
    game.splash("FUN FACT:", "Your body transcribes")
    game.splash("about 75,000 mRNA", "molecules every second.")
    game.splash("NEXT UP...", "mRNA DELIVERY!")
    start_level3()
}

//  ==============================================================
//   9. LEVEL 3 — mRNA MAZE
//  ==============================================================
//  Tile-based maze. Player = mRNA. Goal = ribosome. Collect >=5 ATP
//  orbs and avoid 4 patrolling RNase enzymes. Safe zones restore time
//  and briefly make the player invulnerable. Timer ticks down; hitting
//  3 enzymes or the timer reaching 0 degrades the mRNA.
let LEVEL3_COLS = 10
let LEVEL3_ROWS = 7
let LEVEL3_TILE = 16
let LEVEL3_ORIGIN_X = 8
//  first tile center x
let LEVEL3_ORIGIN_Y = 10
//  first tile center y
let LEVEL3_TIME = 50
let LEVEL3_ENERGY_NEEDED = 3
let LEVEL3_HIT_LIMIT = 4
//  Legend: '.' path  '#' wall  'S' start  'R' ribosome  'E' energy  'V' safe zone
let level3_layout = ["S.........", ".##.###.#.", ".E...#...V", ".###.#.##.", ".....V..E.", "E##.###...", "..E....#.R"]
let level3_walls : Sprite[] = []
let level3_enemies : Sprite[] = []
let level3_energies : Sprite[] = []
let level3_safes : Sprite[] = []
let level3_player : Sprite = null
let level3_ribosome : Sprite = null
let level3_hits = 0
let level3_energy_collected = 0
let level3_invuln_until = 0
function level3_tile_center(r: number, c: number): any[] {
    let x = LEVEL3_ORIGIN_X + c * LEVEL3_TILE
    let y = LEVEL3_ORIGIN_Y + r * LEVEL3_TILE
    return [x, y]
}

function start_level3() {
    let r: number;
    let c: number;
    let ch: string;
    let w: Sprite;
    let e: Sprite;
    let v: Sprite;
    
    
    
    
    
    current_level = 3
    game_running = true
    clear_gameplay_sprites()
    scene.setBackgroundColor(12)
    //  deep wine
    level3_walls = []
    level3_enemies = []
    level3_energies = []
    level3_safes = []
    level3_hits = 0
    level3_energy_collected = 0
    level3_invuln_until = 0
    game.splash("LEVEL 3", "mRNA MAZE")
    game.splash("Collect 3 ATP", "Reach ribosome!")
    game.splash("Avoid RNase", "Safe zones heal")
    game.splash("3 hits = FAIL", "Clock is ticking")
    //  Build the maze
    for (r = 0; r < LEVEL3_ROWS; r++) {
        for (c = 0; c < LEVEL3_COLS; c++) {
            ch = level3_layout[r][c]
            let [x, y] = level3_tile_center(r, c)
            if (ch == "#") {
                w = sprites.create(wall_img(), WALL_KIND)
                w.setPosition(x, y)
                w.setFlag(SpriteFlag.Ghost, false)
                level3_walls.push(w)
            } else if (ch == "S") {
                level3_player = sprites.create(mrna_player_img(), SpriteKind.Player)
                level3_player.setPosition(x, y)
                controller.moveSprite(level3_player, 70, 70)
                level3_player.setFlag(SpriteFlag.StayInScreen, true)
            } else if (ch == "R") {
                level3_ribosome = sprites.create(ribosome_img(), SpriteKind.Food)
                level3_ribosome.setPosition(x, y)
                level3_ribosome.data = "ribosome"
            } else if (ch == "E") {
                e = sprites.create(atp_img(), SpriteKind.Food)
                e.setPosition(x, y)
                e.data = "energy"
                level3_energies.push(e)
            } else if (ch == "V") {
                v = sprites.create(safe_zone_img(), SAFE_KIND)
                v.setPosition(x, y)
                v.setFlag(SpriteFlag.Ghost, true)
                level3_safes.push(v)
            }
            
        }
    }
    //  Spawn 4 patrolling enzymes in specific open tiles
    let enemy_spawn_rows = [0, 4, 6, 2]
    let enemy_spawn_cols = [9, 1, 5, 4]
    for (let i = 0; i < enemy_spawn_rows.length; i++) {
        r = enemy_spawn_rows[i]
        c = enemy_spawn_cols[i]
        let [x, y] = level3_tile_center(r, c)
        e = sprites.create(rnase_img(), SpriteKind.Enemy)
        e.setPosition(x, y)
        level3_enemies.push(e)
    }
    //  Yellow YOU label follows the mRNA player
    spawn_you_label()
    info.startCountdown(LEVEL3_TIME)
    info.onCountdownEnd(function on_level3_time_out() {
        if (current_level == 3 && game_running) {
            game.splash("mRNA DEGRADED!", "Time's up.")
            lose_game("mRNA DEGRADATION")
        }
        
    })
    update_hud()
    sfx_level_up()
}

function _level3_is_wall_tile(r: number, c: number): boolean {
    if (r < 0 || c < 0 || r >= LEVEL3_ROWS || c >= LEVEL3_COLS) {
        return true
    }
    
    return level3_layout[r][c] == "#"
}

function _safe_zone_step() {
    //  If player is standing on a safe zone, consume it: heal, +time, invuln.
    //  Used safes are destroyed, so iterating sprites.all_of_kind(SAFE_KIND)
    //  naturally skips them the next tick.
    
    if (level3_player === null) {
        return
    }
    
    for (let s of sprites.allOfKind(SAFE_KIND)) {
        if (Math.abs(level3_player.x - s.x) < 8 && Math.abs(level3_player.y - s.y) < 8) {
            info.changeCountdownBy(5)
            level3_invuln_until = game.runtime() + 1500
            heal(10)
            sfx_level_up()
            game.splash("SAFE ZONE", "+5s +10 HP")
            s.destroy(effects.coolRadial, 400)
            return
        }
        
    }
}

function level3_on_update() {
    if (current_level != 3 || !game_running) {
        return
    }
    
    _safe_zone_step()
    position_you_label(level3_player)
}

function level3_win() {
    win_game()
}

//  ==============================================================
//   10. WIN / LOSE SCREENS
//  ==============================================================
function win_game() {
    
    game_running = false
    sprites.destroyAllSpritesOfKind(SpriteKind.Enemy)
    sprites.destroyAllSpritesOfKind(SpriteKind.Food)
    sprites.destroyAllSpritesOfKind(SpriteKind.Projectile)
    scene.setBackgroundColor(9)
    effects.confetti.startScreenEffect(3000)
    sfx_win()
    game.splash("* * * * * * *", "* YOU WIN! *")
    game.splash("CELL ALIVE!", "mRNA delivered.")
    //  ---- Educational debrief: mRNA delivery & translation ----
    game.splash("WHAT JUST HAPPENED?", "mRNA Delivery")
    game.splash("mRNA travels from", "nucleus to ribosome")
    game.splash("dodging RNase enzymes", "that would chew it up.")
    game.splash("ATP orbs = energy", "your cell burns.")
    game.splash("Ribosome reads mRNA", "and builds PROTEINS.")
    game.splash("Proteins do", "EVERYTHING in you:")
    game.splash("hemoglobin, insulin,", "antibodies, muscle!")
    game.splash("REAL-WORLD USE #1:", "mRNA Therapeutics")
    game.splash("Scientists deliver", "custom mRNA to cells")
    game.splash("to make missing", "proteins on demand.")
    game.splash("Already used for:", "COVID, cancer, flu.")
    game.splash("REAL-WORLD USE #2:", "Gene Therapy")
    game.splash("For kids with SMA,", "a single dose delivers")
    game.splash("working mRNA and", "saves their lives.")
    game.splash("REAL-WORLD USE #3:", "Sickle Cell Cure")
    game.splash("FDA-approved 2023:", "Casgevy edits mRNA")
    game.splash("production to end", "sickle cell disease.")
    game.splash("THE CENTRAL DOGMA:", "DNA -> RNA -> Protein")
    game.splash("Every cell you have", "runs on this loop")
    game.splash("trillions of times", "every single day.")
    game.splash("FUN FACT:", "Your body makes")
    game.splash("about 2 million", "new proteins PER SECOND.")
    game.splash("FINAL SCORE", "" + score)
    game.splash("Cell health", "" + cell_health + " / 100")
    game.splash("You are a cell!", "Keep it alive.")
    game.splash("Thanks for playing!", "- Cell Studio -")
    game.setGameOverEffect(true, effects.confetti)
    game.gameOver(true)
}

function lose_game(reason: string) {
    
    game_running = false
    sprites.destroyAllSpritesOfKind(SpriteKind.Enemy)
    sprites.destroyAllSpritesOfKind(SpriteKind.Food)
    sprites.destroyAllSpritesOfKind(SpriteKind.Projectile)
    scene.setBackgroundColor(2)
    effects.dissolve.startScreenEffect(1200)
    sfx_death()
    game.splash("GAME OVER", reason)
    game.splash("FINAL SCORE", "" + score)
    game.splash("Cell health", "" + cell_health + " / 100")
    game.setGameOverEffect(false, effects.dissolve)
    game.gameOver(false)
}

//  ==============================================================
//   11. CONTROLLER HANDLERS
//  ==============================================================
controller.A.onEvent(ControllerButtonEvent.Pressed, function on_a() {
    if (current_level == 1) {
        level1_on_a()
    } else if (current_level == 2) {
        level2_on_a()
    }
    
})
controller.B.onEvent(ControllerButtonEvent.Pressed, function on_b() {
    if (current_level == 1) {
        level1_on_b()
    }
    
})
//  ==============================================================
//   12. COLLISION HOOKS
//  ==============================================================
sprites.onOverlap(SpriteKind.Player, SpriteKind.Enemy, function on_mrna_hits_enzyme(sprite: Sprite, other: Sprite) {
    
    if (current_level != 3) {
        return
    }
    
    //  invulnerable window from safe zone?
    if (game.runtime() < level3_invuln_until) {
        return
    }
    
    level3_hits = level3_hits + 1
    other.destroy(effects.fire, 400)
    take_damage(18)
    sfx_damage()
    game.splash("RNase HIT!", "" + (LEVEL3_HIT_LIMIT - level3_hits) + " hits left")
    if (level3_hits >= LEVEL3_HIT_LIMIT) {
        info.stopCountdown()
        game.splash("mRNA DEGRADED!", "Too many hits.")
        lose_game("mRNA DESTROYED")
    }
    
})
sprites.onOverlap(SpriteKind.Player, SpriteKind.Food, function on_mrna_grabs_food(sprite: Sprite, other: Sprite) {
    let needed: number;
    
    if (current_level != 3) {
        return
    }
    
    if (other.data == "ribosome") {
        if (level3_energy_collected >= LEVEL3_ENERGY_NEEDED) {
            info.stopCountdown()
            level3_win()
        } else {
            needed = LEVEL3_ENERGY_NEEDED - level3_energy_collected
            sprite.say("need " + ("" + needed) + "!", 900)
        }
        
        return
    }
    
    if (other.data == "energy") {
        level3_energy_collected = level3_energy_collected + 1
        add_score(10)
        sfx_energy()
        other.destroy(effects.coolRadial, 250)
    }
    
})
//  Player vs walls in Level 3 — block movement
sprites.onOverlap(SpriteKind.Player, WALL_KIND, function on_player_wall(sprite: Sprite, wall: Sprite) {
    //  Push player back to previous tile center
    let dx = sprite.x - wall.x
    let dy = sprite.y - wall.y
    if (Math.abs(dx) > Math.abs(dy)) {
        if (dx > 0) {
            sprite.x = wall.x + wall.width / 2 + sprite.width / 2 + 1
        } else {
            sprite.x = wall.x - wall.width / 2 - sprite.width / 2 - 1
        }
        
    } else if (dy > 0) {
        sprite.y = wall.y + wall.height / 2 + sprite.height / 2 + 1
    } else {
        sprite.y = wall.y - wall.height / 2 - sprite.height / 2 - 1
    }
    
})
//  ==============================================================
//   13. TIMERS / UPDATES
//  ==============================================================
function level2_on_on_update() {
    //  alias — just calls level2_on_update
    level2_on_update()
}

game.onUpdate(function on_update_tick() {
    if (current_level == 1) {
        level1_on_update()
    } else if (current_level == 2) {
        level2_on_on_update()
    } else if (current_level == 3) {
        level3_on_update()
    }
    
})
game.onUpdateInterval(600, function level3_on_enemy_tick() {
    let er: number;
    let ec: number;
    let pr: any;
    let pc: any;
    let dc: number;
    let dr: number;
    let nx: number;
    let ny: number;
    //  Each enzyme steps one tile toward the player along open paths
    if (current_level != 3 || !game_running) {
        return
    }
    
    if (level3_player === null) {
        return
    }
    
    for (let e of sprites.allOfKind(SpriteKind.Enemy)) {
        //  Convert positions to tile indices
        er = Math.trunc((e.y - LEVEL3_ORIGIN_Y + Math.idiv(LEVEL3_TILE, 2)) / LEVEL3_TILE)
        ec = Math.trunc((e.x - LEVEL3_ORIGIN_X + Math.idiv(LEVEL3_TILE, 2)) / LEVEL3_TILE)
        pr = Math.trunc((level3_player.y - LEVEL3_ORIGIN_Y + Math.idiv(LEVEL3_TILE, 2)) / LEVEL3_TILE)
        pc = Math.trunc((level3_player.x - LEVEL3_ORIGIN_X + Math.idiv(LEVEL3_TILE, 2)) / LEVEL3_TILE)
        //  BFS (simple greedy — try horizontal then vertical)
        dc = 0
        dr = 0
        if (pc > ec && !_level3_is_wall_tile(er, ec + 1)) {
            dc = 1
        } else if (pc < ec && !_level3_is_wall_tile(er, ec - 1)) {
            dc = -1
        } else if (pr > er && !_level3_is_wall_tile(er + 1, ec)) {
            dr = 1
        } else if (pr < er && !_level3_is_wall_tile(er - 1, ec)) {
            dr = -1
        } else if (pr > er && !_level3_is_wall_tile(er + 1, ec)) {
            dr = 1
        } else if (pr < er && !_level3_is_wall_tile(er - 1, ec)) {
            dr = -1
        }
        
        nx = e.x + dc * LEVEL3_TILE
        ny = e.y + dr * LEVEL3_TILE
        e.setPosition(nx, ny)
    }
})
//  ==============================================================
//   14. INTRO + MAIN ENTRY
//  ==============================================================
function intro() {
    scene.setBackgroundColor(1)
    game.splash("CELL STUDIO", "'A' to START")
    game.splash("You ARE a cell.", "Keep it alive.")
    game.splash("Three levels:", "Build - Transcribe - Deliver")
    game.splash("Controls:", "D-pad + A/B")
    sfx_level_up()
}

update_hud()
intro()
start_level1()
